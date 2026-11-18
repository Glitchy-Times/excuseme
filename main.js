const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const ROOM_CODE_LENGTH = 6;
const MAX_PLAYERS = 6;
const WRITING_SECONDS = 45;
const VOTING_SECONDS = 30;
const AVATARS = ["🦊", "🐸", "🦄", "🐙", "🦁", "🐼", "🐨", "🐯", "🐵", "🐲", "🐧", "🦉"];
const PEER_OPTIONS = {
	host: "0.peerjs.com",
	port: 443,
	path: "/",
	secure: true,
	debug: 1,
	config: {
		iceServers: [
			{ urls: "stun:stun.l.google.com:19302" }
			// Add a TURN provider here if a player's network blocks direct WebRTC.
		]
	}
};

const SCENARIOS = [
	"I forgot my mom's birthday and she is already on her way over.",
	"I accidentally sent my boss a voice note of me practicing my villain laugh.",
	"I borrowed a neighbor's garden gnome and now it appears to be in charge of my finances.",
	"I told two different friends I was helping them move at the exact same time.",
	"I put my phone in the fridge and the milk in my backpack.",
	"I am three hours late to a party I said I was already at.",
	"I accidentally replied-all to the entire school with a photo of my lunch.",
	"I promised to look after a very judgmental parrot for the weekend.",
	"I got stuck in a revolving door and the building manager knows my name now.",
	"I showed up to a formal dinner wearing two different shoes and one is squeaking.",
	"I ate the clearly labeled office cake before the birthday person arrived.",
	"I told my group chat I was on the way, but I am still wearing a towel.",
	"I accidentally joined a neighborhood committee and they made me treasurer.",
	"I have been arguing with a self-checkout machine for twenty minutes.",
	"I told my dentist I floss daily and now they want to see my technique."
];

const PANIC_EXCUSES = [
	"A committee of pigeons has confiscated my keys pending an investigation into breadcrumb fraud.",
	"My houseplants formed a union and I am legally required to hear their concerns.",
	"A time-traveling raccoon borrowed my calendar and returned it with several new Tuesdays.",
	"My left shoe has gone missing and the right one refuses to testify without a lawyer.",
	"The moon texted me a very complicated riddle and I cannot leave until I solve it.",
	"My smart fridge locked me out after I called it emotionally unavailable.",
	"I got trapped in a staring contest with a goldfish and the goldfish has excellent stamina.",
	"A tiny marching band appeared in my hallway and I am waiting for the encore to end.",
	"My shadow is running late, and we agreed we would arrive places together.",
	"A squirrel challenged me to a chess match for control of the bird feeder.",
	"I accidentally scheduled a performance review with my house keys.",
	"The elevator asked me a personal question and I need a little time to process it.",
	"A flock of geese has mistaken me for their regional manager.",
	"My laundry basket has achieved sentience and is requesting weekends off.",
	"I am helping a very small wizard locate his extremely average-sized hat."
];

const $ = (selector) => document.querySelector(selector);
const homeView = $("#home-view");
const lobbyView = $("#lobby-view");
const gameView = $("#game-view");
const connectionLabel = $("#connection-label");
const connectionDot = $("#connection-dot");
const reconnectButton = $("#reconnect-button");
const leaveRoomButton = $("#leave-room-button");
const toast = $("#toast");
const roomCodeInput = $("#room-code-input");
const nicknameInput = $("#nickname");

let peer = null;
let localConnection = null;
let myPeerId = "";
let hostPeerId = "";
let roomCode = "";
let nickname = "";
let isHost = false;
let game = createGameState();
let peerConnections = new Map();
let timerInterval = null;
let toastTimeout = null;
let audioContext = null;
let soundEnabled = false;
let leavingRoom = false;

function createGameState() {
	return {
		phase: "lobby",
		round: 1,
		victimId: null,
		prompt: "",
		players: {},
		submissions: [],
		votes: {},
		voteMode: false,
		winnerSubmissionId: null,
		notice: "",
		deadline: null,
		secondsLeft: null
	};
}

function setConnectionStatus(message, kind = "waiting") {
	connectionLabel.textContent = message;
	connectionDot.className = `connection-dot ${kind === "online" ? "online" : kind === "error" ? "error" : ""}`;
}

function showView(view) {
	homeView.hidden = view !== "home";
	lobbyView.hidden = view !== "lobby";
	gameView.hidden = view !== "game";
}

function showToast(message, kind = "") {
	toast.textContent = message;
	toast.className = `toast show${kind ? ` ${kind}` : ""}`;
	window.clearTimeout(toastTimeout);
	toastTimeout = window.setTimeout(() => {
		toast.classList.remove("show");
	}, 3200);
}

function cleanText(value, limit) {
	return String(value || "")
		.replace(/[\u0000-\u001f\u007f]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, limit);
}

function getNickname() {
	return cleanText(nicknameInput.value, 18) || "Mystery Guest";
}

function activePlayerIds() {
	return Object.values(game.players)
		.filter((player) => player.connected)
		.sort((a, b) => a.order - b.order)
		.map((player) => player.id);
}

function currentPlayerCount() {
	return activePlayerIds().length;
}

function randomRoomCode() {
	let code = "";
	for (let index = 0; index < ROOM_CODE_LENGTH; index += 1) {
		code += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
	}
	return code;
}

function randomItem(items) {
	return items[Math.floor(Math.random() * items.length)];
}

function makeId() {
	if (window.crypto && typeof window.crypto.randomUUID === "function") {
		return window.crypto.randomUUID();
	}
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function playTone(frequency = 540, duration = 0.075) {
	if (!soundEnabled) return;
	const AudioContextClass = window.AudioContext || window.webkitAudioContext;
	if (!AudioContextClass) return;
	audioContext = audioContext || new AudioContextClass();
	if (audioContext.state === "suspended") {
		audioContext.resume().catch((error) => console.warn("Could not resume sound:", error));
	}
	const oscillator = audioContext.createOscillator();
	const gain = audioContext.createGain();
	oscillator.type = "sine";
	oscillator.frequency.value = frequency;
	gain.gain.setValueAtTime(0.08, audioContext.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
	oscillator.connect(gain);
	gain.connect(audioContext.destination);
	oscillator.start();
	oscillator.stop(audioContext.currentTime + duration);
}

function handlePeerError(error) {
	console.error("PeerJS error:", error);
	setConnectionStatus(error.type === "peer-unavailable" ? "Room not found" : "Connection problem", "error");
	if (error.type === "peer-unavailable") {
		showToast("That room code isn't online. Check the code and try again.", "error");
	} else if (error.type === "unavailable-id") {
		showToast("That room code is already in use. Leave and create another room.", "error");
	} else {
		showToast("Peer connection error. Check your connection and try again.", "error");
	}
}

function attachPeerEvents(instance) {
	instance.on("error", handlePeerError);
	instance.on("disconnected", () => {
		if (leavingRoom) return;
		setConnectionStatus("Signaling disconnected", "error");
		if (reconnectButton) reconnectButton.hidden = false;
	});
}

function retrySignaling() {
	if (!peer || peer.destroyed) {
		showToast("There is no active peer connection to retry.", "error");
		return;
	}
	try {
		peer.reconnect();
		setConnectionStatus("Reconnecting to signaling…");
	} catch (error) {
		console.error("Could not reconnect to PeerJS signaling:", error);
		showToast("Could not reconnect. Leave the room and try again.", "error");
	}
}

function setupHost() {
	if (typeof window.Peer !== "function") {
		setConnectionStatus("PeerJS could not load", "error");
		showToast("PeerJS did not load. Check your internet connection and reload.", "error");
		return;
	}

	isHost = true;
	leavingRoom = false;
	nickname = getNickname();
	roomCode = randomRoomCode();
	hostPeerId = `excusegpt-${roomCode}`;
	game = createGameState();
	setConnectionStatus("Opening room…");

	try {
		peer = new window.Peer(hostPeerId, PEER_OPTIONS);
	} catch (error) {
		console.error("Could not create host peer:", error);
		setConnectionStatus("Could not create room", "error");
		showToast("Could not create a peer connection. Please try again.", "error");
		return;
	}

	attachPeerEvents(peer);
	peer.on("connection", acceptIncomingConnection);
	peer.on("open", (id) => {
		if (myPeerId) {
			setConnectionStatus("Room ready · P2P", "online");
			if (reconnectButton) reconnectButton.hidden = true;
			return;
		}
		myPeerId = id;
		game.players[id] = {
			id,
			name: nickname,
			avatar: randomItem(AVATARS),
			score: 0,
			connected: true,
			host: true,
			order: 0
		};
		setConnectionStatus("Room ready · P2P", "online");
		if (reconnectButton) reconnectButton.hidden = true;
		if (leaveRoomButton) leaveRoomButton.hidden = false;
		$("#room-code").textContent = roomCode;
		showView("lobby");
		renderLobby();
		showToast("Room created. Invite your players!", "success");
		playTone(660);
	});
}

function setupGuest(code) {
	if (typeof window.Peer !== "function") {
		setConnectionStatus("PeerJS could not load", "error");
		showToast("PeerJS did not load. Check your internet connection and reload.", "error");
		return;
	}

	isHost = false;
	leavingRoom = false;
	nickname = getNickname();
	roomCode = code;
	hostPeerId = `excusegpt-${code}`;
	setConnectionStatus("Connecting to host…");

	try {
		peer = new window.Peer(undefined, PEER_OPTIONS);
	} catch (error) {
		console.error("Could not create guest peer:", error);
		setConnectionStatus("Could not join room", "error");
		showToast("Could not create a peer connection. Please try again.", "error");
		return;
	}

	attachPeerEvents(peer);
	peer.on("open", (id) => {
		if (localConnection) {
			setConnectionStatus(`Connected · ${roomCode}`, "online");
			if (reconnectButton) reconnectButton.hidden = true;
			return;
		}
		myPeerId = id;
		const connection = peer.connect(hostPeerId, { reliable: true });
		localConnection = connection;
		connection.on("open", () => {
			connection.send({ type: "hello", name: nickname });
			setConnectionStatus("Waiting for host…");
		});
		connection.on("data", handleGuestPacket);
		connection.on("close", handleHostConnectionClosed);
		connection.on("error", (error) => {
			console.error("Peer connection error:", error);
			setConnectionStatus("Connection interrupted", "error");
			showToast("WebRTC could not connect. Check the host and network; restrictive networks may need a TURN relay.", "error");
		});
	});
}

function acceptIncomingConnection(connection) {
	connection.on("data", (packet) => {
		if (!packet || typeof packet !== "object") return;
		if (packet.type === "hello") {
			acceptGuest(connection, packet.name);
			return;
		}
		if (packet.type === "action" && peerConnections.get(connection.peer) === connection) {
			handleHostAction(connection.peer, packet.action, packet.payload || {});
		}
	});
	connection.on("close", () => handlePlayerDisconnect(connection.peer));
	connection.on("error", (error) => {
		console.error(`Connection error for ${connection.peer}:`, error);
		handlePlayerDisconnect(connection.peer);
	});
}

function acceptGuest(connection, submittedName) {
	const id = connection.peer;
	if (game.phase !== "lobby") {
		safeSend(connection, { type: "rejected", message: "This game has already started." });
		connection.close();
		return;
	}
	if (game.players[id] && game.players[id].connected) {
		safeSend(connection, { type: "rejected", message: "You are already connected to this room." });
		connection.close();
		return;
	}
	if (currentPlayerCount() >= MAX_PLAYERS) {
		safeSend(connection, { type: "rejected", message: "This room already has six players." });
		connection.close();
		return;
	}

	const previous = game.players[id];
	game.players[id] = {
		id,
		name: cleanText(submittedName, 18) || "Mystery Guest",
		avatar: previous ? previous.avatar : randomItem(AVATARS),
		score: previous ? previous.score : 0,
		connected: true,
		host: false,
		order: previous ? previous.order : currentPlayerCount()
	};
	peerConnections.set(id, connection);
	safeSend(connection, { type: "accepted", state: makeSnapshot(id) });
	game.notice = `${game.players[id].name} joined the room.`;
	broadcastState();
	showToast(`${game.players[id].name} joined!`, "success");
	playTone(520);
}

function safeSend(connection, packet) {
	if (!connection || !connection.open) return false;
	try {
		connection.send(packet);
		return true;
	} catch (error) {
		console.error(`Could not send to ${connection.peer}:`, error);
		return false;
	}
}

function handleGuestPacket(packet) {
	if (!packet || typeof packet !== "object") return;
	if (packet.type === "rejected") {
		showToast(packet.message || "The host rejected this connection.", "error");
		setConnectionStatus("Room unavailable", "error");
		leaveRoom(false);
		return;
	}
	if (packet.type === "accepted" || packet.type === "state") {
		applySnapshot(packet.state);
		setConnectionStatus(`Connected · ${roomCode}`, "online");
		if (reconnectButton) reconnectButton.hidden = true;
		if (leaveRoomButton) leaveRoomButton.hidden = false;
		showView(packet.state.phase === "lobby" ? "lobby" : "game");
		return;
	}
	if (packet.type === "tick" && Number.isFinite(packet.secondsLeft)) {
		game.secondsLeft = packet.secondsLeft;
		renderTimer(packet.secondsLeft);
	}
	if (packet.type === "host-closed") {
		handleHostConnectionClosed();
	}
}

function handleHostConnectionClosed() {
	if (leavingRoom || !peer) return;
	setConnectionStatus("Host connection closed", "error");
	showToast("The host left the room. You can start or join another game.", "error");
	window.setTimeout(() => leaveRoom(false), 900);
}

function makeSnapshot(recipientId) {
	const showAuthors = game.phase === "roundEnd" || game.phase === "final";
	const players = {};
	for (const [id, player] of Object.entries(game.players)) {
		players[id] = {
			id,
			name: player.name,
			avatar: player.avatar,
			score: player.score,
			connected: player.connected,
			host: player.host,
			order: player.order
		};
	}
	return {
		phase: game.phase,
		round: game.round,
		victimId: game.victimId,
		prompt: game.prompt,
		players,
		submissions: game.submissions.map((submission) => ({
			id: submission.id,
			text: submission.text,
			confidence: submission.confidence,
			authorName: showAuthors ? game.players[submission.authorId]?.name || "Disconnected player" : null
		})),
		votesReceived: Object.keys(game.votes).length,
		votesExpected: expectedVoters().length,
		myVote: game.votes[recipientId] || null,
		mySubmissionId: game.submissions.find((submission) => submission.authorId === recipientId)?.id || null,
		voteMode: game.voteMode,
		winnerSubmissionId: game.winnerSubmissionId,
		notice: game.notice,
		secondsLeft: game.secondsLeft
	};
}

function applySnapshot(snapshot) {
	if (!snapshot || typeof snapshot !== "object") return;
	game = {
		...createGameState(),
		...snapshot,
		deadline: null
	};
	renderGame();
}

function broadcastState() {
	if (!isHost) return;
	renderGame();
	for (const [id, connection] of peerConnections) {
		if (!game.players[id]?.connected) continue;
		safeSend(connection, { type: "state", state: makeSnapshot(id) });
	}
}

function broadcastTick() {
	const secondsLeft = Math.max(0, Math.ceil((game.deadline - Date.now()) / 1000));
	game.secondsLeft = secondsLeft;
	renderTimer(secondsLeft);
	for (const connection of peerConnections.values()) {
		safeSend(connection, { type: "tick", secondsLeft });
	}
}

function startCountdown(seconds, onExpire) {
	stopCountdown();
	game.deadline = Date.now() + seconds * 1000;
	game.secondsLeft = seconds;
	renderTimer(seconds);
	timerInterval = window.setInterval(() => {
		if (!game.deadline) return;
		const remaining = Math.max(0, Math.ceil((game.deadline - Date.now()) / 1000));
		if (remaining !== game.secondsLeft) broadcastTick();
		if (remaining <= 0) {
			stopCountdown();
			onExpire();
		}
	}, 250);
}

function stopCountdown() {
	window.clearInterval(timerInterval);
	timerInterval = null;
	game.deadline = null;
	game.secondsLeft = null;
}

function renderTimer(seconds) {
	const timer = $("#timer");
	if (seconds === null || seconds === undefined) {
		timer.textContent = "—";
		timer.classList.remove("urgent");
		return;
	}
	timer.textContent = `${Math.max(0, seconds)}s`;
	timer.classList.toggle("urgent", seconds <= 10);
}

function renderLobby() {
	$("#room-code").textContent = roomCode || "----";
	const players = Object.values(game.players)
		.filter((player) => player.connected)
		.sort((a, b) => a.order - b.order);
	const list = $("#lobby-players");
	list.replaceChildren();
	for (const player of players) {
		const item = document.createElement("li");
		item.className = "player";
		const avatar = document.createElement("span");
		avatar.className = "player-avatar";
		avatar.textContent = player.avatar;
		const name = document.createElement("span");
		name.className = "player-name";
		name.textContent = player.name;
		const meta = document.createElement("span");
		meta.className = "player-meta";
		meta.textContent = player.host ? "HOST" : "READY";
		item.append(avatar, name, meta);
		list.append(item);
	}
	const canStart = isHost && players.length >= 2 && game.phase === "lobby";
	$("#start-game-button").disabled = !canStart;
	$("#lobby-hint").textContent = players.length < 2
		? "Waiting for at least one more player…"
		: `${players.length} of ${MAX_PLAYERS} players connected.`;
}

function renderGame() {
	if (!isHost && !myPeerId) return;
	if (game.phase === "lobby") {
		showView("lobby");
		renderLobby();
		return;
	}
	showView("game");
	$("#round-label").textContent = game.phase === "final" ? "Match complete" : `Round ${game.round} of 3`;
	$("#phase-label").textContent = phaseDescription();
	$("#game-notice").textContent = game.notice || "";
	renderTimer(game.secondsLeft);

	const stages = {
		"prompt-stage": game.phase === "prompt",
		"writing-stage": game.phase === "writing",
		"reveal-stage": game.phase === "reveal",
		"results-stage": game.phase === "roundEnd" || game.phase === "final"
	};
	for (const [id, visible] of Object.entries(stages)) {
		$(`#${id}`).hidden = !visible;
	}

	if (game.phase === "prompt") renderPromptStage();
	if (game.phase === "writing") renderWritingStage();
	if (game.phase === "reveal") renderRevealStage();
	if (game.phase === "roundEnd" || game.phase === "final") renderResultsStage();
}

function phaseDescription() {
	switch (game.phase) {
		case "prompt": return "The victim has the floor";
		case "writing": return "Write a wildly convincing excuse";
		case "reveal": return game.voteMode ? "Anonymous judging is open" : "The victim is choosing";
		case "roundEnd": return "The verdict is in";
		case "final": return "The match is over";
		default: return "Getting ready";
	}
}

function renderPromptStage() {
	const isVictim = myPeerId === game.victimId;
	$("#victim-prompt-controls").hidden = !isVictim;
	$("#prompt-waiting").hidden = isVictim;
	if (!isVictim) {
		const victim = game.players[game.victimId];
		$("#prompt-waiting").textContent = `Waiting for ${victim?.name || "the victim"} to admit what went wrong… Get your best excuse ready.`;
	}
}

function renderWritingStage() {
	$("#writing-prompt").textContent = game.prompt;
	const isWriter = myPeerId !== game.victimId;
	$("#writer-controls").hidden = !isWriter;
	$("#writing-waiting").hidden = isWriter;
	if (isWriter) {
		const alreadySubmitted = Boolean(mySubmissionId());
		$("#excuse-input").disabled = alreadySubmitted;
		$("#panic-button").disabled = alreadySubmitted;
		$("#submit-excuse-button").disabled = alreadySubmitted;
		$("#writing-waiting").hidden = true;
	} else {
		const count = game.submissions.length;
		$("#writing-waiting").textContent = `${count} excuse${count === 1 ? "" : "s"} locked in. The writers are working on your alibi…`;
	}
}

function renderRevealStage() {
	const isVictim = myPeerId === game.victimId;
	const canVote = game.voteMode && !isVictim;
	$("#reveal-instructions").textContent = game.voteMode
		? canVote ? "Pick the excuse you'd trust in a completely imaginary court. You cannot vote for your own." : "The writers are voting anonymously. The victim is off the hook for this decision."
		: isVictim ? "Choose the best excuse. The writers' identities are hidden until after your pick." : "The victim is reading the anonymous excuses and will choose the winner.";
	renderExcuseCards($("#reveal-cards"), {
		submissions: game.submissions,
		interactive: canVote || (!game.voteMode && isVictim),
		showAuthors: false,
		winnerId: null,
		onPick: (id) => sendAction(game.voteMode ? "vote" : "select-winner", { submissionId: id })
	});
	const currentVote = myVoteId();
	const ownVote = game.submissions.find((submission) => submission.id === currentVote);
	if (ownVote) {
		$("#vote-progress").textContent = `Your vote is locked in: “${ownVote.text}”`;
	} else if (game.voteMode) {
		const votesReceived = isHost ? Object.keys(game.votes).length : game.votesReceived;
		const votesExpected = isHost ? expectedVoters().length : game.votesExpected;
		$("#vote-progress").textContent = `${votesReceived} of ${votesExpected} votes received.`;
	} else {
		$("#vote-progress").textContent = "";
	}
}

function renderExcuseCards(container, options) {
	container.replaceChildren();
	for (const submission of options.submissions) {
		const card = document.createElement("article");
		card.className = "excuse-card";
		const confidence = document.createElement("p");
		confidence.className = "confidence";
		confidence.textContent = `${submission.confidence}% · GASLIGHT ACCURACY`;
		const text = document.createElement("p");
		text.className = "excuse-copy";
		text.textContent = submission.text;
		card.append(confidence, text);
		if (options.showAuthors) {
			const author = document.createElement("p");
			author.className = "excuse-author";
			const authorName = submission.authorName || game.players[submission.authorId]?.name || "a mysterious genius";
			author.textContent = `Written by ${authorName}`;
			card.append(author);
		}
		if (options.winnerId === submission.id) {
			card.style.borderColor = "var(--mint)";
			card.style.boxShadow = "0 0 0 1px rgb(118 240 194 / 25%)";
		}
		if (options.interactive) {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "button mint vote-button";
			button.textContent = options.winnerId === submission.id ? "Winner" : "Select this excuse";
			button.disabled = Boolean(myVoteId()) || mySubmissionId() === submission.id;
			button.addEventListener("click", () => options.onPick(submission.id));
			card.append(button);
		}
		container.append(card);
	}
	if (options.submissions.length === 0) {
		const empty = document.createElement("p");
		empty.className = "waiting-card";
		empty.textContent = "Nobody submitted an excuse. The silence is suspicious.";
		container.append(empty);
	}
}

function myVoteId() {
	return isHost ? game.votes[myPeerId] || null : game.myVote || null;
}

function mySubmissionId() {
	return isHost
		? game.submissions.find((submission) => submission.authorId === myPeerId)?.id || null
		: game.mySubmissionId || null;
}

function renderResultsStage() {
	const isFinal = game.phase === "final";
	$("#results-kicker").textContent = isFinal ? "Final podium" : `Round ${game.round} results`;
	$("#results-title").textContent = isFinal ? "The excuse champion." : "Who wrote what?!";
	renderExcuseCards($("#result-cards"), {
		submissions: game.submissions,
		interactive: false,
		showAuthors: true,
		winnerId: game.winnerSubmissionId
	});
	renderLeaderboard();
	const winner = game.submissions.find((submission) => submission.id === game.winnerSubmissionId);
	$("#copy-receipt-button").hidden = !winner;
	if (isFinal) {
		$("#advance-button").textContent = "Play again";
		$("#advance-hint").textContent = isHost ? "Start a fresh match with the same room." : "Waiting for the host to start another match.";
		$("#advance-button").disabled = !isHost;
	} else {
		$("#advance-button").textContent = game.round >= 3 ? "See final podium" : "Next round";
		$("#advance-hint").textContent = isHost ? "The victim role rotates for the next round." : "Waiting for the host to continue.";
		$("#advance-button").disabled = !isHost;
	}
}

function renderLeaderboard() {
	const list = $("#leaderboard");
	list.replaceChildren();
	const players = Object.values(game.players).sort((a, b) => b.score - a.score || a.order - b.order);
	players.forEach((player, index) => {
		const row = document.createElement("div");
		row.className = "score-row";
		const rank = document.createElement("span");
		rank.className = "score-rank";
		rank.textContent = `#${index + 1}`;
		const name = document.createElement("span");
		name.className = "score-name";
		name.textContent = `${player.avatar} ${player.name}${player.connected ? "" : " · disconnected"}`;
		const score = document.createElement("span");
		score.className = "score-points";
		score.textContent = `${player.score.toLocaleString()} pts`;
		row.append(rank, name, score);
		list.append(row);
	});
}

function chooseVictim(previousVictimId = null, random = false) {
	const ids = activePlayerIds();
	if (ids.length === 0) return null;
	if (random || !previousVictimId || !ids.includes(previousVictimId)) {
		return random ? randomItem(ids) : ids[0];
	}
	return ids[(ids.indexOf(previousVictimId) + 1) % ids.length];
}

function startGame() {
	if (!isHost || game.phase !== "lobby") return;
	if (currentPlayerCount() < 2) {
		showToast("At least two connected players are needed.", "error");
		return;
	}
	game.round = 1;
	game.victimId = chooseVictim(null, true);
	game.prompt = "";
	game.submissions = [];
	game.votes = {};
	game.voteMode = false;
	game.winnerSubmissionId = null;
	game.notice = "Round one. Someone is about to make a confession.";
	game.phase = "prompt";
	broadcastState();
	playTone(660, 0.12);
}

function submitPrompt(playerId, prompt) {
	if (game.phase !== "prompt" || playerId !== game.victimId) return;
	const cleaned = cleanText(prompt, 220);
	if (!cleaned) {
		showToast("Add a situation or roll a random one first.", "error");
		return;
	}
	game.prompt = cleaned;
	game.submissions = [];
	game.votes = {};
	game.phase = "writing";
	game.notice = "The writers have 45 seconds. Make it convincing-ish.";
	startCountdown(WRITING_SECONDS, beginReveal);
	broadcastState();
	playTone(580);
}

function allWritersSubmitted() {
	const writers = activePlayerIds().filter((id) => id !== game.victimId);
	return writers.length > 0 && writers.every((id) => game.submissions.some((submission) => submission.authorId === id));
}

function submitExcuse(playerId, text) {
	if (game.phase !== "writing" || playerId === game.victimId || !game.players[playerId]?.connected) return;
	if (game.submissions.some((submission) => submission.authorId === playerId)) return;
	const cleaned = cleanText(text, 400);
	if (!cleaned) {
		if (playerId === myPeerId) showToast("Write an excuse before locking it in.", "error");
		return;
	}
	game.submissions.push({
		id: makeId(),
		authorId: playerId,
		text: cleaned,
		confidence: (96 + Math.random() * 3.9).toFixed(1)
	});
	game.notice = `${game.submissions.length} excuse${game.submissions.length === 1 ? "" : "s"} locked in.`;
	broadcastState();
	playTone(740);
	if (allWritersSubmitted()) beginReveal();
}

function beginReveal() {
	if (game.phase !== "writing") return;
	stopCountdown();
	game.phase = "reveal";
	game.submissions = shuffle(game.submissions);
	game.votes = {};
	game.voteMode = currentPlayerCount() >= 4;
	game.notice = game.submissions.length
		? "Identities hidden. Confidence levels entirely fabricated."
		: "Time's up. The writers have produced only suspense.";
	broadcastState();
	playTone(620);
	if (game.submissions.length === 0) {
		finishRound(null);
		return;
	}
	if (game.voteMode) {
		startCountdown(VOTING_SECONDS, finishVoting);
		broadcastState();
	}
}

function expectedVoters() {
	return activePlayerIds().filter((id) => id !== game.victimId);
}

function finishVoting() {
	if (game.phase !== "reveal" || !game.voteMode) return;
	const counts = new Map(game.submissions.map((submission) => [submission.id, 0]));
	for (const submissionId of Object.values(game.votes)) {
		if (counts.has(submissionId)) counts.set(submissionId, counts.get(submissionId) + 1);
	}
	const maxVotes = Math.max(0, ...counts.values());
	const leaders = game.submissions.filter((submission) => counts.get(submission.id) === maxVotes);
	const winner = leaders.length ? randomItem(leaders) : null;
	finishRound(winner?.id || null);
}

function finishRound(submissionId) {
	stopCountdown();
	game.winnerSubmissionId = submissionId;
	const winningSubmission = game.submissions.find((submission) => submission.id === submissionId);
	if (winningSubmission && game.players[winningSubmission.authorId]) {
		game.players[winningSubmission.authorId].score += 1000;
		game.notice = `${game.players[winningSubmission.authorId].name} takes the round!`;
	} else {
		game.notice = "No winning excuse this round. The mystery deepens.";
	}
	game.phase = "roundEnd";
	broadcastState();
	playTone(winningSubmission ? 880 : 310, 0.13);
}

function advanceMatch() {
	if (!isHost) return;
	if (game.phase === "final") {
		for (const player of Object.values(game.players)) player.score = 0;
		game.round = 1;
		game.victimId = chooseVictim(null, true);
		game.phase = "prompt";
		game.prompt = "";
		game.submissions = [];
		game.votes = {};
		game.voteMode = false;
		game.winnerSubmissionId = null;
		game.notice = "A fresh match. The truth is still optional.";
		broadcastState();
		playTone(660);
		return;
	}
	if (game.phase !== "roundEnd") return;
	if (game.round >= 3) {
		game.phase = "final";
		game.notice = "Three rounds. One deeply questionable champion.";
		broadcastState();
		return;
	}
	game.round += 1;
	game.victimId = chooseVictim(game.victimId);
	game.phase = "prompt";
	game.prompt = "";
	game.submissions = [];
	game.votes = {};
	game.voteMode = false;
	game.winnerSubmissionId = null;
	game.notice = `Round ${game.round}. The victim role has moved on.`;
	broadcastState();
	playTone(660);
}

function handleHostAction(playerId, action, payload) {
	if (!game.players[playerId]?.connected) return;
	switch (action) {
		case "prompt":
			if (playerId === game.victimId) submitPrompt(playerId, payload.prompt);
			break;
		case "excuse":
			submitExcuse(playerId, payload.text);
			break;
		case "select-winner":
			if (game.phase === "reveal" && !game.voteMode && playerId === game.victimId) {
				const valid = game.submissions.some((submission) => submission.id === payload.submissionId);
				if (valid) finishRound(payload.submissionId);
			}
			break;
		case "vote":
			if (game.phase === "reveal" && game.voteMode && playerId !== game.victimId &&
				expectedVoters().includes(playerId) && !game.votes[playerId]) {
				const submission = game.submissions.find((item) => item.id === payload.submissionId);
				if (!submission || submission.authorId === playerId) return;
				game.votes[playerId] = submission.id;
				game.notice = `${Object.keys(game.votes).length} vote${Object.keys(game.votes).length === 1 ? "" : "s"} received.`;
				broadcastState();
				playTone(520);
				if (expectedVoters().every((id) => game.votes[id])) finishVoting();
			}
			break;
		default:
			console.warn("Ignored unknown game action:", action);
	}
}

function sendAction(action, payload) {
	if (isHost) {
		handleHostAction(myPeerId, action, payload);
		return;
	}
	if (!localConnection || !localConnection.open) {
		showToast("You are not connected to the host.", "error");
		return;
	}
	safeSend(localConnection, { type: "action", action, payload });
}

function handlePlayerDisconnect(id) {
	const player = game.players[id];
	if (!player || !player.connected || !isHost) return;
	player.connected = false;
	peerConnections.delete(id);
	const name = player.name;

	if (currentPlayerCount() < 2 && game.phase !== "lobby") {
		stopCountdown();
		game.phase = "lobby";
		game.round = 1;
		game.victimId = null;
		game.prompt = "";
		game.submissions = [];
		game.votes = {};
		game.voteMode = false;
		game.winnerSubmissionId = null;
		game.notice = `${name} disconnected. At least two players are needed to continue; waiting in the lobby.`;
		broadcastState();
		return;
	}

	if (game.phase === "writing") {
		game.submissions = game.submissions.filter((submission) => submission.authorId !== id);
		if (game.victimId === id) {
			stopCountdown();
			game.phase = "prompt";
			game.victimId = chooseVictim(id);
			game.prompt = "";
			game.submissions = [];
			game.votes = {};
			game.notice = `${name} disconnected. The round restarts with a new victim.`;
		} else {
			game.notice = `${name} disconnected. The timer continues for the remaining writers.`;
		}
		broadcastState();
		if (game.phase === "writing" && allWritersSubmitted()) beginReveal();
		return;
	}

	if (game.phase === "prompt" && game.victimId === id) {
		game.victimId = chooseVictim(id);
		game.notice = `${name} disconnected. ${game.players[game.victimId]?.name || "A new player"} is the victim now.`;
	}

	if (game.phase === "reveal") {
		delete game.votes[id];
		if (game.victimId === id) {
			game.victimId = chooseVictim(id);
			game.voteMode = true;
			game.votes = {};
			game.notice = `${name} disconnected. The remaining players will vote.`;
			startCountdown(VOTING_SECONDS, finishVoting);
		} else {
			game.notice = `${name} disconnected. The remaining players can still decide.`;
		}
		broadcastState();
		if (game.voteMode && expectedVoters().every((voterId) => game.votes[voterId])) finishVoting();
		return;
	}

	game.notice = `${name} disconnected.`;
	broadcastState();
}

function shuffle(items) {
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const other = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
	}
	return shuffled;
}

function copyText(text) {
	if (navigator.clipboard && window.isSecureContext) {
		return navigator.clipboard.writeText(text).catch((error) => {
			console.warn("Clipboard API unavailable; trying a browser fallback.", error);
			return copyUsingFallback(text);
		});
	}
	return copyUsingFallback(text);
}

function copyUsingFallback(text) {
	const temporary = document.createElement("textarea");
	temporary.value = text;
	temporary.setAttribute("readonly", "");
	temporary.style.position = "fixed";
	temporary.style.opacity = "0";
	document.body.append(temporary);
	temporary.select();
	let success = false;
	try {
		success = document.execCommand("copy");
	} finally {
		temporary.remove();
	}
	return success ? Promise.resolve() : Promise.reject(new Error("Clipboard access was denied."));
}

async function copyWithFeedback(text, successMessage) {
	try {
		await copyText(text);
		showToast(successMessage, "success");
	} catch (error) {
		console.error("Could not copy text:", error);
		showToast("Copy failed. Select and copy the text manually.", "error");
	}
}

function inviteText() {
	if (window.location.protocol === "file:") {
		return `ExcuseGPT room ${roomCode} — open the game on an HTTPS static website and enter this code.`;
	}
	const invite = new URL(window.location.href);
	invite.searchParams.set("room", roomCode);
	return invite.toString();
}

function copyWinningReceipt() {
	const submission = game.submissions.find((item) => item.id === game.winnerSubmissionId);
	if (!submission) return;
	const author = game.players[submission.authorId]?.name || "A mysterious genius";
	const receiptAuthor = submission.authorName || author;
	const receipt = [
		"ExcuseGPT · Party Mode",
		`Round ${game.round} winning excuse`,
		`Situation: ${game.prompt}`,
		`“${submission.text}”`,
		`Written by: ${receiptAuthor}`,
		`${submission.confidence}% Gaslight Accuracy · +1,000 points`
	].join("\n");
	copyWithFeedback(receipt, "Winning receipt copied!");
}

function toggleSound() {
	soundEnabled = !soundEnabled;
	const button = $("#sound-toggle");
	button.textContent = soundEnabled ? "🔊" : "🔇";
	button.title = soundEnabled ? "Sound effects on" : "Sound effects off";
	button.setAttribute("aria-label", soundEnabled ? "Disable sound effects" : "Enable sound effects");
	if (soundEnabled) playTone(680);
}

function leaveRoom(showMessage = true) {
	leavingRoom = true;
	stopCountdown();
	for (const connection of peerConnections.values()) {
		try {
			connection.close();
		} catch (error) {
			console.warn("Could not close peer connection:", error);
		}
	}
	peerConnections.clear();
	if (localConnection) {
		try {
			localConnection.close();
		} catch (error) {
			console.warn("Could not close host connection:", error);
		}
		localConnection = null;
	}
	if (peer) {
		try {
			peer.destroy();
		} catch (error) {
			console.warn("Could not destroy peer:", error);
		}
		peer = null;
	}
	myPeerId = "";
	hostPeerId = "";
	roomCode = "";
	isHost = false;
	game = createGameState();
	showView("home");
	setConnectionStatus("Not connected");
	if (reconnectButton) reconnectButton.hidden = true;
	if (leaveRoomButton) leaveRoomButton.hidden = true;
	if (showMessage) showToast("You left the room.");
	window.setTimeout(() => {
		leavingRoom = false;
	}, 0);
}

$("#host-button").addEventListener("click", setupHost);
$("#join-button").addEventListener("click", () => {
	const code = cleanText(roomCodeInput.value, ROOM_CODE_LENGTH).toUpperCase();
	if (!new RegExp(`^[A-Z]{${ROOM_CODE_LENGTH}}$`).test(code)) {
		showToast("Enter the six-letter room code.", "error");
		return;
	}
	setupGuest(code);
});
$("#start-game-button").addEventListener("click", startGame);
$("#leave-lobby-button").addEventListener("click", () => leaveRoom());
leaveRoomButton.addEventListener("click", () => leaveRoom());
$("#copy-code-button").addEventListener("click", () => copyWithFeedback(roomCode, "Room code copied."));
$("#copy-invite-button").addEventListener("click", () => {
	const message = window.location.protocol === "file:"
		? "Room code copied. For other devices, publish this page on HTTPS first."
		: "Invite link copied.";
	copyWithFeedback(inviteText(), message);
});
$("#prompt-form").addEventListener("submit", (event) => {
	event.preventDefault();
	sendAction("prompt", { prompt: $("#situation-input").value });
});
$("#random-situation-button").addEventListener("click", () => {
	$("#situation-input").value = randomItem(SCENARIOS);
	playTone(480);
});
$("#panic-button").addEventListener("click", () => {
	$("#excuse-input").value = randomItem(PANIC_EXCUSES);
	$("#excuse-input").focus();
	playTone(740);
});
$("#submit-excuse-button").addEventListener("click", () => {
	sendAction("excuse", { text: $("#excuse-input").value });
});
$("#advance-button").addEventListener("click", advanceMatch);
$("#copy-receipt-button").addEventListener("click", copyWinningReceipt);
$("#sound-toggle").addEventListener("click", toggleSound);
if (reconnectButton) reconnectButton.addEventListener("click", retrySignaling);

const roomFromUrl = new URLSearchParams(window.location.search).get("room");
if (roomFromUrl && new RegExp(`^[A-Za-z]{${ROOM_CODE_LENGTH}}$`).test(roomFromUrl)) {
	roomCodeInput.value = roomFromUrl.toUpperCase();
}

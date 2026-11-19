const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const ROOM_CODE_LENGTH = 6;
const MAX_PLAYERS = 10;
const MAX_ROUNDS = 15;
const DEFAULT_PROMPT_SECONDS = 70;
const DEFAULT_WRITING_SECONDS = 45;
const MIN_PHASE_SECONDS = 15;
const MAX_PHASE_SECONDS = 120;
const PHASE_SECONDS_STEP = 5;
const VOTING_SECONDS = 30;
const AVATARS = ["🦊", "🐸", "🦄", "🐙", "🦁", "🐼", "🐨", "🐯", "🐵", "🐲", "🐧", "🦉"];
const BOT_NAMES = ["Mildly Suspicious", "The Excuse Intern", "Captain Alibi", "Definitely Busy", "Calendar Goblin", "Plausible-ish"];
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

// Expand this local-only library by adding keyword groups and quote arrays.
const BOT_EXCUSE_LIBRARY = [
	{
		keywords: ["boss", "office", "work", "shift", "meeting", "coworker", "late"],
		excuses: [
			"My calendar invited a second meeting to the same time slot, and they are currently resolving it in a tiny boardroom.",
			"I got stuck explaining to the printer why it cannot keep promoting itself to department manager.",
			"The office plant looked unwell, so I had to chair an emergency wellness meeting."
		]
	},
	{
		keywords: ["date", "tinder", "babe", "crush", "romantic", "anniversary"],
		excuses: [
			"I was practicing casual conversation in the mirror and accidentally scheduled a three-hour follow-up.",
			"My imaginary wingman had a scheduling conflict, and I refuse to make this kind of decision unsupervised.",
			"I got lost in a very intense debate about whether a first date can have a dress rehearsal."
		]
	},
	{
		keywords: ["party", "drinks", "hangout", "hang", "friends", "club"],
		excuses: [
			"I promised to bring ice, but the freezer has developed a complicated feelings-based access policy.",
			"I took a wrong turn while following a group chat poll and ended up at a very small cheese tasting.",
			"My social battery needs a firmware update, and the progress bar is being unusually dramatic."
		]
	},
	{
		keywords: ["mom", "mother", "dad", "father", "family", "birthday", "parents"],
		excuses: [
			"I was preparing a heartfelt family speech, but my notes have been adopted by the dog.",
			"My aunt started a family group chat poll and I am legally obligated to wait for the results.",
			"I got assigned to supervise the dessert table, and the pudding has become unexpectedly political."
		]
	},
	{
		keywords: ["school", "class", "teacher", "homework", "exam", "college", "lecture"],
		excuses: [
			"My notes escaped into the wrong folder and are currently being taught as a very niche elective.",
			"I accidentally studied the syllabus for a class that does not exist until next semester.",
			"The school printer ate my assignment and left a surprisingly detailed apology."
		]
	},
	{
		keywords: ["move", "moving", "boxes", "apartment", "house", "neighbor"],
		excuses: [
			"I labeled every box, but the labels have formed a union and are negotiating new destinations.",
			"The staircase and my sofa have reached a disagreement that requires a neutral mediator.",
			"I found one more box, and it appears to contain only smaller boxes and a mysterious kazoo."
		]
	},
	{
		keywords: ["doctor", "dentist", "appointment", "health", "clinic"],
		excuses: [
			"I had to reassure my houseplant that the appointment was not about its leaves.",
			"The waiting room fish recognized me and requested an update on our previous conversation.",
			"I accidentally practiced my symptoms as a dramatic monologue and need a moment to return to normal."
		]
	},
	{
		keywords: ["travel", "flight", "airport", "train", "bus", "trip", "vacation"],
		excuses: [
			"My suitcase is packed, but it has not yet agreed to the proposed destination.",
			"I followed the airport signs with complete confidence and arrived at a very convincing storage closet.",
			"The train schedule and my snack schedule are in mediation."
		]
	},
	{
		keywords: ["dog", "cat", "pet", "vet", "puppy", "kitten"],
		excuses: [
			"My cat has hidden the keys again and is insisting this is an enrichment activity.",
			"The dog discovered a second leash and now believes we are running a tiny transportation company.",
			"My pet sitter sent a photo that requires immediate analysis by the household committee."
		]
	},
	{
		keywords: [],
		excuses: [
			"A committee of pigeons has confiscated my keys pending an investigation into breadcrumb fraud.",
			"My houseplants formed a union and I am legally required to hear their concerns.",
			"A time-traveling raccoon borrowed my calendar and returned it with several new Tuesdays."
		]
	}
];

const $ = (selector) => document.querySelector(selector);
const homeView = $("#home-view");
const lobbyView = $("#lobby-view");
const gameView = $("#game-view");
const connectionLabel = $("#connection-label");
const connectionDot = $("#connection-dot");
const connectionBadge = connectionLabel.closest(".connection");
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
let leavingRoom = false;
let peerStage = "idle";

function createGameState() {
	return {
		phase: "lobby",
		round: 1,
		totalRounds: 3,
		promptSeconds: DEFAULT_PROMPT_SECONDS,
		writingSeconds: DEFAULT_WRITING_SECONDS,
		victimId: null,
		prompt: "",
		players: {},
		submissions: [],
		drafts: {},
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
	connectionBadge.hidden = kind === "online";
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
		.filter((player) => player.connected && !player.isBot)
		.sort((a, b) => a.order - b.order)
		.map((player) => player.id);
}

function activeRoomPlayers() {
	return Object.values(game.players)
		.filter((player) => player.connected)
		.sort((a, b) => a.order - b.order);
}

function currentPlayerCount() {
	return activeRoomPlayers().length;
}

function currentHumanCount() {
	return activePlayerIds().length;
}

function randomRoomCode() {
	if (!window.crypto || typeof window.crypto.getRandomValues !== "function") {
		throw new Error("Secure random number generation is unavailable.");
	}
	let code = "";
	const limit = Math.floor(256 / ROOM_ALPHABET.length) * ROOM_ALPHABET.length;
	while (code.length < ROOM_CODE_LENGTH) {
		const bytes = new Uint8Array(ROOM_CODE_LENGTH);
		window.crypto.getRandomValues(bytes);
		for (const byte of bytes) {
			if (byte < limit) code += ROOM_ALPHABET[byte % ROOM_ALPHABET.length];
			if (code.length === ROOM_CODE_LENGTH) break;
		}
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

function handlePeerError(error) {
	console.error("PeerJS error:", error);
	const descriptions = {
		"browser-incompatible": "This browser does not support the WebRTC features the game needs. Try current Safari on iPadOS.",
		network: peerStage === "signaling"
			? "Could not reach PeerJS signaling over HTTPS/WebSocket. The device network or a management filter may block it."
			: "The PeerJS signaling connection was lost. Check the device network or management filter.",
		"socket-error": "The PeerJS signaling WebSocket failed. Check device restrictions or ask school IT whether 0.peerjs.com is allowed.",
		"socket-closed": "The signaling connection closed. A network filter or unstable connection may be responsible.",
		"server-error": "PeerJS signaling could not be reached. Check the device's network and filtering settings.",
		webrtc: peerStage === "signaling"
			? "The WebRTC data channel failed before signaling completed. Check browser support and the device's network policy."
			: "PeerJS signaling worked, but the WebRTC data channel failed. The iPad's network policy may block peer traffic."
	};
	const message = error.type === "peer-unavailable"
		? "That room code isn't online. Check the code and try again."
		: error.type === "unavailable-id"
			? "That room code is already in use. Leave and create another room."
			: descriptions[error.type] || `Peer connection failed (${error.type || "unknown error"}). Check the device network and browser restrictions.`;
	setConnectionStatus(error.type === "peer-unavailable" ? "Room not found" : "Connection problem", "error");
	showToast(message, "error");
}

function runDeviceCheck() {
	const result = $("#device-check-result");
	const RTCPeerConnectionClass = window.RTCPeerConnection || window.webkitRTCPeerConnection;
	const checks = [
		["Page served over HTTPS", window.location.protocol === "https:"],
		["Secure browser context", Boolean(window.isSecureContext)],
		["PeerJS library loaded", typeof window.Peer === "function"],
		["WebSocket API available", typeof window.WebSocket === "function"],
		["WebRTC API available", typeof RTCPeerConnectionClass === "function"],
		["Browser reports network online", navigator.onLine]
	];
	let dataChannelAvailable = false;
	if (typeof RTCPeerConnectionClass === "function") {
		let testPeer;
		try {
			testPeer = new RTCPeerConnectionClass({ iceServers: [] });
			const channel = testPeer.createDataChannel("support-check");
			dataChannelAvailable = Boolean(channel);
			channel.close();
		} catch (error) {
			console.warn("Local WebRTC feature check failed:", error);
		} finally {
			if (testPeer) testPeer.close();
		}
	}
	checks.push(["WebRTC data channel can be created", dataChannelAvailable]);

	const lines = checks.map(([label, passed]) => `${passed ? "PASS" : "CHECK"}  ${label}`);
	lines.push("", "These are local browser checks, not a test of the school's network path.");
	lines.push("If all pass but joining fails, compare this with your phone and ask school IT about PeerJS signaling and WebRTC restrictions.");
	result.textContent = lines.join("\n");
	result.hidden = false;
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
	try {
		roomCode = randomRoomCode();
	} catch (error) {
		setConnectionStatus("Could not create room", "error");
		showToast(error.message, "error");
		console.error("Could not configure a secure room:", error);
		return;
	}
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
			setConnectionStatus("Connected", "online");
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
			isBot: false,
			order: 0
		};
		setConnectionStatus("Connected", "online");
		if (reconnectButton) reconnectButton.hidden = true;
		if (leaveRoomButton) leaveRoomButton.hidden = false;
		$("#room-code").textContent = roomCode;
		showView("lobby");
		renderLobby();
		showToast("Room created. Invite your players!", "success");
	});
}

function setupGuest(code) {
	if (typeof window.Peer !== "function") {
		setConnectionStatus("PeerJS could not load", "error");
		showToast("PeerJS did not load. Check your internet connection and reload.", "error");
		return;
	}
	const RTCPeerConnectionClass = window.RTCPeerConnection || window.webkitRTCPeerConnection;
	if (typeof RTCPeerConnectionClass !== "function") {
		setConnectionStatus("WebRTC unavailable", "error");
		showToast("This browser does not expose WebRTC. Try current Safari on iPadOS or ask the device administrator.", "error");
		return;
	}

	isHost = false;
	leavingRoom = false;
	nickname = getNickname();
	roomCode = code;
	hostPeerId = `excusegpt-${code}`;
	peerStage = "signaling";
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
		peerStage = "webrtc";
		const connection = peer.connect(hostPeerId, { reliable: true });
		localConnection = connection;
		connection.on("open", () => {
			peerStage = "connected";
			connection.send({ type: "hello", name: nickname });
			setConnectionStatus("Waiting for host…");
		});
		connection.on("data", handleGuestPacket);
		connection.on("close", handleHostConnectionClosed);
		connection.on("error", (error) => {
			console.error("Peer connection error:", error);
			handlePeerError(error);
		});
	});
}

function acceptIncomingConnection(connection) {
	connection.on("data", (packet) => {
		try {
			if (!packet || typeof packet !== "object" || JSON.stringify(packet).length > 8192) {
				throw new Error("Invalid or oversized peer message.");
			}
		} catch (error) {
			console.warn(`Rejected invalid peer data from ${connection.peer}:`, error);
			connection.close();
			return;
		}
		if (packet.type === "hello") {
			acceptGuest(connection, packet.name);
			return;
		}
		if (packet.type === "action" && typeof packet.action === "string" &&
			isRecord(packet.payload) && peerConnections.get(connection.peer) === connection) {
			handleHostAction(connection.peer, packet.action, packet.payload);
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
		safeSend(connection, { type: "rejected", message: "This room already has ten players or bots." });
		connection.close();
		return;
	}

	const previous = game.players[id];
	const occupiedOrders = new Set(activeRoomPlayers().map((player) => player.order));
	game.players[id] = {
		id,
		name: cleanText(submittedName, 18) || "Mystery Guest",
		avatar: previous ? previous.avatar : randomItem(AVATARS),
		score: previous ? previous.score : 0,
		connected: true,
		host: false,
		isBot: false,
		order: previous && !occupiedOrders.has(previous.order) ? previous.order : nextPlayerOrder()
	};
	peerConnections.set(id, connection);
	safeSend(connection, { type: "accepted", state: makeSnapshot(id) });
	game.notice = `${game.players[id].name} joined the room.`;
	broadcastState();
	showToast(`${game.players[id].name} joined!`, "success");
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
	try {
		if (JSON.stringify(packet).length > 16000) {
			throw new Error("The host sent an oversized message.");
		}
	} catch (error) {
		console.error("Rejected an invalid message from the host:", error);
		setConnectionStatus("Invalid room data", "error");
		showToast("This room sent data the game could not safely read.", "error");
		leaveRoom(false);
		return;
	}
	if (packet.type === "rejected") {
		showToast(packet.message || "The host rejected this connection.", "error");
		setConnectionStatus("Room unavailable", "error");
		leaveRoom(false);
		return;
	}
	if (packet.type === "accepted" || packet.type === "state") {
		if (!applySnapshot(packet.state)) return;
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
			isBot: Boolean(player.isBot),
			order: player.order
		};
	}
	return {
		phase: game.phase,
		round: game.round,
		totalRounds: game.totalRounds,
		promptSeconds: game.promptSeconds,
		writingSeconds: game.writingSeconds,
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
	try {
		game = normalizeSnapshot(snapshot);
	} catch (error) {
		console.error("Rejected invalid game state from the host:", error);
		setConnectionStatus("Invalid room data", "error");
		showToast("This room sent invalid game data. Disconnecting for safety.", "error");
		leaveRoom(false);
		return false;
	}
	renderGame();
	return true;
}

function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function boundedString(value, maxLength, fieldName, allowEmpty = true) {
	if (typeof value !== "string" || value.length > maxLength || (!allowEmpty && value.length === 0)) {
		throw new Error(`Invalid ${fieldName}.`);
	}
	return value;
}

function normalizeSnapshot(snapshot) {
	const phases = ["lobby", "prompt", "writing", "reveal", "roundEnd", "final"];
	if (!isRecord(snapshot) || !phases.includes(snapshot.phase)) throw new Error("Invalid phase.");
	if (!Number.isInteger(snapshot.totalRounds) || snapshot.totalRounds < 1 || snapshot.totalRounds > MAX_ROUNDS) {
		throw new Error("Invalid round limit.");
	}
	if (!Number.isInteger(snapshot.promptSeconds) || snapshot.promptSeconds < MIN_PHASE_SECONDS ||
		snapshot.promptSeconds > MAX_PHASE_SECONDS ||
		!Number.isInteger(snapshot.writingSeconds) || snapshot.writingSeconds < MIN_PHASE_SECONDS ||
		snapshot.writingSeconds > MAX_PHASE_SECONDS) {
		throw new Error("Invalid phase timer settings.");
	}
	if (!Number.isInteger(snapshot.round) || snapshot.round < 1 || snapshot.round > snapshot.totalRounds) {
		throw new Error("Invalid round number.");
	}
	if (!isRecord(snapshot.players) || Object.keys(snapshot.players).length > 32) throw new Error("Invalid player list.");

	const players = Object.create(null);
	for (const [id, player] of Object.entries(snapshot.players)) {
		if (!id || id.length > 128 || !isRecord(player) || player.id !== id ||
			typeof player.connected !== "boolean" || typeof player.host !== "boolean" ||
			typeof player.isBot !== "boolean" ||
			!Number.isInteger(player.score) || player.score < 0 || player.score > MAX_ROUNDS * 1000 ||
			!Number.isInteger(player.order) || player.order < 0 || player.order >= MAX_PLAYERS) {
			throw new Error("Invalid player data.");
		}
		players[id] = {
			id,
			name: boundedString(player.name, 18, "player name"),
			avatar: boundedString(player.avatar, 8, "player avatar", false),
			score: player.score,
			connected: player.connected,
			host: player.host,
			isBot: player.isBot,
			order: player.order
		};
	}

	if (snapshot.victimId !== null && (typeof snapshot.victimId !== "string" ||
		!Object.prototype.hasOwnProperty.call(players, snapshot.victimId))) {
		throw new Error("Invalid victim.");
	}
	if (snapshot.victimId !== null && players[snapshot.victimId].isBot) {
		throw new Error("A bot cannot be the victim.");
	}
	if (!Array.isArray(snapshot.submissions) || snapshot.submissions.length > MAX_PLAYERS - 1) {
		throw new Error("Invalid submissions.");
	}
	const submissionIds = new Set();
	const submissions = snapshot.submissions.map((submission) => {
		if (!isRecord(submission) || typeof submission.id !== "string" || !submission.id ||
			submission.id.length > 128 || submissionIds.has(submission.id) ||
			typeof submission.confidence !== "string" || !/^(9[6-9]\.\d|100\.0)$/.test(submission.confidence)) {
			throw new Error("Invalid submission metadata.");
		}
		submissionIds.add(submission.id);
		return {
			id: submission.id,
			text: boundedString(submission.text, 400, "excuse"),
			confidence: submission.confidence,
			authorName: submission.authorName === null
				? null
				: boundedString(submission.authorName, 18, "submission author")
		};
	});

	const optionalId = (value, fieldName) => {
		if (value === null) return null;
		if (typeof value !== "string" || !submissionIds.has(value)) throw new Error(`Invalid ${fieldName}.`);
		return value;
	};
	if (typeof snapshot.voteMode !== "boolean" || typeof snapshot.notice !== "string" ||
		typeof snapshot.votesReceived !== "number" || !Number.isInteger(snapshot.votesReceived) ||
		snapshot.votesReceived < 0 || snapshot.votesReceived > MAX_PLAYERS ||
		typeof snapshot.votesExpected !== "number" || !Number.isInteger(snapshot.votesExpected) ||
		snapshot.votesExpected < 0 || snapshot.votesExpected > MAX_PLAYERS) {
		throw new Error("Invalid game status.");
	}
	if (snapshot.secondsLeft !== null && (!Number.isInteger(snapshot.secondsLeft) ||
		snapshot.secondsLeft < 0 || snapshot.secondsLeft > Math.max(MAX_PHASE_SECONDS, VOTING_SECONDS))) {
		throw new Error("Invalid timer.");
	}

	return {
		...createGameState(),
		phase: snapshot.phase,
		round: snapshot.round,
		totalRounds: snapshot.totalRounds,
		promptSeconds: snapshot.promptSeconds,
		writingSeconds: snapshot.writingSeconds,
		victimId: snapshot.victimId,
		prompt: boundedString(snapshot.prompt, 220, "situation"),
		players,
		submissions,
		votes: {},
		votesReceived: snapshot.votesReceived,
		votesExpected: snapshot.votesExpected,
		myVote: optionalId(snapshot.myVote, "vote"),
		mySubmissionId: optionalId(snapshot.mySubmissionId, "player submission"),
		voteMode: snapshot.voteMode,
		winnerSubmissionId: optionalId(snapshot.winnerSubmissionId, "winning submission"),
		notice: boundedString(snapshot.notice, 180, "status message"),
		secondsLeft: snapshot.secondsLeft,
		deadline: null
	};
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
	$("#round-count-display").textContent = game.totalRounds;
	$("#decrease-rounds-button").disabled = !isHost || game.totalRounds <= 1;
	$("#increase-rounds-button").disabled = !isHost || game.totalRounds >= MAX_ROUNDS;
	$("#prompt-seconds-display").textContent = game.promptSeconds;
	$("#decrease-prompt-seconds-button").disabled = !isHost || game.promptSeconds <= MIN_PHASE_SECONDS;
	$("#increase-prompt-seconds-button").disabled = !isHost || game.promptSeconds >= MAX_PHASE_SECONDS;
	$("#writing-seconds-display").textContent = game.writingSeconds;
	$("#decrease-writing-seconds-button").disabled = !isHost || game.writingSeconds <= MIN_PHASE_SECONDS;
	$("#increase-writing-seconds-button").disabled = !isHost || game.writingSeconds >= MAX_PHASE_SECONDS;
	$("#room-settings-hint").textContent = isHost
		? "Settings are shared with everyone in the room."
		: "Room settings are controlled by the host.";
	const players = activeRoomPlayers();
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
		meta.textContent = player.isBot ? "BOT" : player.host ? "HOST" : "READY";
		item.append(avatar, name, meta);
		list.append(item);
	}
	const bots = players.filter((player) => player.isBot);
	const maxBotCount = Math.max(0, MAX_PLAYERS - currentHumanCount());
	$("#bot-count-display").textContent = `${bots.length} / ${maxBotCount}`;
	$("#decrease-bots-button").disabled = !isHost || bots.length === 0 || game.phase !== "lobby";
	$("#increase-bots-button").disabled = !isHost || bots.length >= maxBotCount || game.phase !== "lobby";
	const botList = $("#bot-manager-list");
	botList.replaceChildren();
	if (bots.length === 0) {
		const empty = document.createElement("li");
		empty.className = "subtle";
		empty.textContent = "No bots added yet.";
		botList.append(empty);
	}
	for (const bot of bots) {
		const item = document.createElement("li");
		item.className = "bot-manager-item";
		const avatar = document.createElement("span");
		avatar.textContent = bot.avatar;
		const name = document.createElement("span");
		name.className = "bot-manager-name";
		name.textContent = bot.name;
		item.append(avatar, name);
		if (isHost) {
			const remove = document.createElement("button");
			remove.className = "button ghost small";
			remove.type = "button";
			remove.textContent = "Remove";
			remove.setAttribute("aria-label", `Remove bot ${bot.name}`);
			remove.addEventListener("click", () => removeBot(bot.id));
			item.append(remove);
		}
		botList.append(item);
	}
	$("#bot-settings-hint").textContent = isHost
		? `${bots.length} of ${maxBotCount} possible bots. ${players.length} of ${MAX_PLAYERS} room places used.`
		: "The host manages bots. Humans and bots share 10 room places.";
	const canStart = isHost && currentHumanCount() >= 2 && game.phase === "lobby";
	$("#start-game-button").disabled = !canStart;
	$("#lobby-hint").textContent = currentHumanCount() < 2
		? "Waiting for one more human player…"
		: `${currentHumanCount()} human player${currentHumanCount() === 1 ? "" : "s"} and ${bots.length} bot${bots.length === 1 ? "" : "s"} · ${players.length} of ${MAX_PLAYERS} places used.`;
}

function renderGame() {
	if (!isHost && !myPeerId) return;
	if (game.phase === "lobby") {
		showView("lobby");
		renderLobby();
		return;
	}
	showView("game");
	$("#round-label").textContent = game.phase === "final" ? "Match complete" : `Round ${game.round} of ${game.totalRounds}`;
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
	if (isVictim) $("#situation-input").value = "";
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
		$("#advance-button").textContent = game.round >= game.totalRounds ? "See final podium" : "Next round";
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

function startPromptTimer() {
	startCountdown(game.promptSeconds, () => {
		if (game.phase !== "prompt" || !game.victimId) return;
		const draft = game.drafts[game.victimId]?.prompt;
		submitPrompt(game.victimId, draft || randomItem(SCENARIOS));
	});
}

function createBotExcuse(prompt) {
	const normalizedPrompt = prompt.toLowerCase();
	const group = BOT_EXCUSE_LIBRARY.find((entry) =>
		entry.keywords.some((keyword) => normalizedPrompt.includes(keyword))
	) || BOT_EXCUSE_LIBRARY[BOT_EXCUSE_LIBRARY.length - 1];
	return randomItem(group.excuses);
}

function addBotSubmissions() {
	for (const bot of activeRoomPlayers().filter((player) => player.isBot)) {
		game.submissions.push({
			id: makeId(),
			authorId: bot.id,
			text: createBotExcuse(game.prompt),
			confidence: (96 + Math.random() * 3.9).toFixed(1)
		});
	}
}

function startGame() {
	if (!isHost || game.phase !== "lobby") return;
	if (currentHumanCount() < 2) {
		showToast("At least two human players are needed.", "error");
		return;
	}
	game.round = 1;
	game.victimId = chooseVictim(null, true);
	game.prompt = "";
	game.submissions = [];
	game.votes = {};
	game.drafts = {};
	game.voteMode = false;
	game.winnerSubmissionId = null;
	game.notice = "Round one. Someone is about to make a confession.";
	game.phase = "prompt";
	startPromptTimer();
	broadcastState();
}

function submitPrompt(playerId, prompt) {
	if (game.phase !== "prompt" || playerId !== game.victimId) return;
	const cleaned = cleanText(prompt, 220);
	if (!cleaned) {
		showToast("Add a situation or roll a random one first.", "error");
		return;
	}
	stopCountdown();
	game.prompt = cleaned;
	game.submissions = [];
	game.votes = {};
	game.drafts = {};
	game.phase = "writing";
	addBotSubmissions();
	game.notice = `The writers have ${game.writingSeconds} seconds. Make it convincing-ish.`;
	startCountdown(game.writingSeconds, finishWritingPhase);
	broadcastState();
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
	delete game.drafts[playerId];
	game.submissions.push({
		id: makeId(),
		authorId: playerId,
		text: cleaned,
		confidence: (96 + Math.random() * 3.9).toFixed(1)
	});
	game.notice = `${game.submissions.length} excuse${game.submissions.length === 1 ? "" : "s"} locked in.`;
	broadcastState();
	if (allWritersSubmitted()) beginReveal();
}

function finishWritingPhase() {
	if (game.phase !== "writing") return;
	for (const playerId of activePlayerIds()) {
		if (playerId === game.victimId ||
			game.submissions.some((submission) => submission.authorId === playerId)) continue;
		const draft = game.drafts[playerId]?.excuse;
		const cleaned = cleanText(draft, 400);
		if (!cleaned) continue;
		game.submissions.push({
			id: makeId(),
			authorId: playerId,
			text: cleaned,
			confidence: (96 + Math.random() * 3.9).toFixed(1)
		});
	}
	beginReveal();
}

function beginReveal() {
	if (game.phase !== "writing") return;
	stopCountdown();
	game.phase = "reveal";
	game.submissions = shuffle(game.submissions);
	game.votes = {};
	game.voteMode = currentHumanCount() >= 4;
	game.notice = game.submissions.length
		? "Identities hidden. Confidence levels entirely fabricated."
		: "Time's up. The writers have produced only suspense.";
	broadcastState();
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
		game.drafts = {};
		game.voteMode = false;
		game.winnerSubmissionId = null;
		game.notice = "A fresh match. The truth is still optional.";
		startPromptTimer();
		broadcastState();
		return;
	}
	if (game.phase !== "roundEnd") return;
	if (game.round >= game.totalRounds) {
		game.phase = "final";
		game.notice = `${game.totalRounds} ${game.totalRounds === 1 ? "round" : "rounds"}. One deeply questionable champion.`;
		broadcastState();
		return;
	}
	game.round += 1;
	game.victimId = chooseVictim(game.victimId);
	game.phase = "prompt";
	game.prompt = "";
	game.submissions = [];
	game.votes = {};
	game.drafts = {};
	game.voteMode = false;
	game.winnerSubmissionId = null;
	game.notice = `Round ${game.round}. The victim role has moved on.`;
	startPromptTimer();
	broadcastState();
}

function updateDraft(playerId, kind, value) {
	if (typeof value !== "string" || value.length > 1000) return;
	if (kind === "prompt" && game.phase === "prompt" && playerId === game.victimId) {
		game.drafts[playerId] = { prompt: cleanText(value, 220) };
	} else if (kind === "excuse" && game.phase === "writing" && playerId !== game.victimId) {
		const current = game.drafts[playerId] || {};
		game.drafts[playerId] = { ...current, excuse: cleanText(value, 400) };
	}
}

function handleHostAction(playerId, action, payload) {
	if (!game.players[playerId]?.connected) return;
	switch (action) {
		case "draft":
			updateDraft(playerId, payload.kind, payload.text);
			break;
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

function sendDraft(kind, text) {
	const payload = { kind, text };
	if (isHost) {
		handleHostAction(myPeerId, "draft", payload);
	} else if (localConnection?.open) {
		safeSend(localConnection, { type: "action", action: "draft", payload });
	}
}

function handlePlayerDisconnect(id) {
	const player = game.players[id];
	if (!player || !player.connected || !isHost) return;
	player.connected = false;
	peerConnections.delete(id);
	delete game.drafts[id];
	const name = player.name;

	if (currentHumanCount() < 2 && game.phase !== "lobby") {
		stopCountdown();
		game.phase = "lobby";
		game.round = 1;
		game.victimId = null;
		game.prompt = "";
		game.submissions = [];
		game.votes = {};
		game.drafts = {};
		game.voteMode = false;
		game.winnerSubmissionId = null;
		game.notice = `${name} disconnected. At least two human players are needed to continue; waiting in the lobby.`;
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
			game.drafts = {};
			game.notice = `${name} disconnected. The round restarts with a new victim.`;
			startPromptTimer();
		} else {
			game.notice = `${name} disconnected. The timer continues for the remaining writers.`;
		}
		broadcastState();
		if (game.phase === "writing" && allWritersSubmitted()) beginReveal();
		return;
	}

	if (game.phase === "prompt" && game.victimId === id) {
		game.victimId = chooseVictim(id);
		game.drafts = {};
		game.notice = `${name} disconnected. ${game.players[game.victimId]?.name || "A new player"} is the victim now.`;
		startPromptTimer();
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

function setExpandablePanel(panelId, buttonId, open) {
	const panel = $(`#${panelId}`);
	const button = $(`#${buttonId}`);
	button.setAttribute("aria-expanded", String(open));
	panel.setAttribute("aria-hidden", String(!open));
	if (open) {
		panel.classList.remove("is-closing");
		panel.hidden = false;
		return;
	}
	if (panel.hidden) return;
	panel.classList.add("is-closing");
	window.setTimeout(() => {
		if (button.getAttribute("aria-expanded") !== "true") {
			panel.hidden = true;
			panel.classList.remove("is-closing");
		}
	}, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180);
}

function toggleRoomSettings() {
	const open = $("#room-settings-button").getAttribute("aria-expanded") !== "true";
	setExpandablePanel("room-settings-panel", "room-settings-button", open);
}

function nextPlayerOrder() {
	const used = new Set(activeRoomPlayers().map((player) => player.order));
	for (let order = 0; order < MAX_PLAYERS; order += 1) {
		if (!used.has(order)) return order;
	}
	return MAX_PLAYERS - 1;
}

function changeRoundCount(amount) {
	if (!isHost || game.phase !== "lobby") return;
	game.totalRounds = Math.max(1, Math.min(MAX_ROUNDS, game.totalRounds + amount));
	broadcastState();
}

function changePhaseDuration(setting, amount) {
	if (!isHost || game.phase !== "lobby") return;
	if (setting === "promptSeconds") {
		game.promptSeconds = Math.max(MIN_PHASE_SECONDS,
			Math.min(MAX_PHASE_SECONDS, game.promptSeconds + amount * PHASE_SECONDS_STEP));
	} else if (setting === "writingSeconds") {
		game.writingSeconds = Math.max(MIN_PHASE_SECONDS,
			Math.min(MAX_PHASE_SECONDS, game.writingSeconds + amount * PHASE_SECONDS_STEP));
	} else {
		return;
	}
	broadcastState();
}

function addBot() {
	const botCount = activeRoomPlayers().filter((player) => player.isBot).length;
	const maxBotCount = Math.max(0, MAX_PLAYERS - currentHumanCount());
	if (!isHost || game.phase !== "lobby" || currentPlayerCount() >= MAX_PLAYERS || botCount >= maxBotCount) return;
	const existingNames = new Set(Object.values(game.players).map((player) => player.name));
	const availableNames = BOT_NAMES.filter((name) => !existingNames.has(name));
	const baseName = availableNames.length ? randomItem(availableNames) : `Excuse Bot ${currentPlayerCount()}`;
	const id = `bot-${makeId()}`;
	game.players[id] = {
		id,
		name: baseName,
		avatar: randomItem(AVATARS),
		score: 0,
		connected: true,
		host: false,
		isBot: true,
		order: nextPlayerOrder()
	};
	game.notice = `${baseName} joined the room.`;
	broadcastState();
}

function removeBot(id) {
	const bot = game.players[id];
	if (!isHost || game.phase !== "lobby" || !bot?.isBot) return;
	delete game.players[id];
	game.notice = `${bot.name} left the room.`;
	broadcastState();
}

function removeLastBot() {
	const lastBot = activeRoomPlayers()
		.filter((player) => player.isBot)
		.sort((a, b) => b.order - a.order)[0];
	if (lastBot) removeBot(lastBot.id);
}

function leaveRoom(showMessage = true) {
	leavingRoom = true;
	stopCountdown();
	setExpandablePanel("room-settings-panel", "room-settings-button", false);
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
$("#room-settings-button").addEventListener("click", toggleRoomSettings);
$("#decrease-bots-button").addEventListener("click", removeLastBot);
$("#increase-bots-button").addEventListener("click", addBot);
$("#decrease-rounds-button").addEventListener("click", () => changeRoundCount(-1));
$("#increase-rounds-button").addEventListener("click", () => changeRoundCount(1));
$("#decrease-prompt-seconds-button").addEventListener("click", () => changePhaseDuration("promptSeconds", -1));
$("#increase-prompt-seconds-button").addEventListener("click", () => changePhaseDuration("promptSeconds", 1));
$("#decrease-writing-seconds-button").addEventListener("click", () => changePhaseDuration("writingSeconds", -1));
$("#increase-writing-seconds-button").addEventListener("click", () => changePhaseDuration("writingSeconds", 1));
$("#situation-input").addEventListener("input", (event) => sendDraft("prompt", event.target.value));
$("#excuse-input").addEventListener("input", (event) => sendDraft("excuse", event.target.value));
$("#random-situation-button").addEventListener("click", () => {
	$("#situation-input").value = randomItem(SCENARIOS);
	sendDraft("prompt", $("#situation-input").value);
});
$("#panic-button").addEventListener("click", () => {
	$("#excuse-input").value = randomItem(PANIC_EXCUSES);
	sendDraft("excuse", $("#excuse-input").value);
	$("#excuse-input").focus();
});
$("#submit-excuse-button").addEventListener("click", () => {
	sendAction("excuse", { text: $("#excuse-input").value });
});
$("#advance-button").addEventListener("click", advanceMatch);
$("#copy-receipt-button").addEventListener("click", copyWinningReceipt);
$("#device-check-button").addEventListener("click", runDeviceCheck);
if (reconnectButton) reconnectButton.addEventListener("click", retrySignaling);

const roomFromUrl = new URLSearchParams(window.location.search).get("room");
if (roomFromUrl && new RegExp(`^[A-Za-z]{${ROOM_CODE_LENGTH}}$`).test(roomFromUrl)) {
	roomCodeInput.value = roomFromUrl.toUpperCase();
}

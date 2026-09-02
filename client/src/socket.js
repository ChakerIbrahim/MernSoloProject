// One shared Socket.IO connection for the whole app. Every component that
// needs real-time features imports this same instance, rather than each one
// opening its own separate connection to the server
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  withCredentials: true,
});

export default socket;
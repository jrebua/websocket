import { useEffect, useRef, useState } from "react";
import "./App.css";

// form default value
const defaultSocketRoute = "127.0.0.1:433";
const FORM_DEFAULT = {
  url: "",
  route: "",
};

function App() {
  const [isConnected, setConnected] = useState(false);
  const [form, setFormValue] = useState(FORM_DEFAULT); // declare form state
  const [logs, setLogs] = useState([]); // logs for event received from socket;
  const [sendEvent, setSendEvent] = useState("");
  const socket = useRef(); // ref for socket
  // change event
  const handleChange = (e) => {
    const { name, value } = e.target; // destructure event and get target value & name
    setFormValue((prev) => ({
      ...prev,
      [name]: value, // set state value depending on  input field(name)
    }));
  };

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const { route, url } = form; // get route & url from form
    socket.current = new WebSocket(
      `ws://${route || defaultSocketRoute}/${url}`
    ); // initiate web socket connection, if socket route is empty. use default
    if (socket.current) {
      setConnected(true);
    }
  };

  const handleSendEvent = (e) => {
    e.preventDefault();

    if (socket.current) {
      // check if socket has a value
      socket?.current?.send(sendEvent);
      setSendEvent("");
    }
  };

  useEffect(() => {
    if (isConnected && socket.current) {
      socket?.current?.addEventListener("message", (msg) => {
        // initiate listen connection to webSocket
        try {
          const data = JSON.parse(msg?.data); // parse data message before adding to list
          setLogs((prev) => [data, ...prev]);
          // setLogs((prev) => prev.unshift(data)); // add new event on top of the list
        } catch (err) {
          // console.log(err, name);
        }
      });
    }
    return () => {
      // close connection when component is unmounting
      if (socket.current && isConnected) {
        socket.current?.close(); // close connection
        socket?.current?.removeEventListener("message", () => {}); // remove message event
      }
    };
  }, [socket, isConnected]);
  console.log(sendEvent);
  return (
    <div className="container">
      <p>Default connection is {`${defaultSocketRoute}`}</p>
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input"
          name="route"
          value={form.route}
          placeholder={`Socket URL (${defaultSocketRoute})`}
          onChange={handleChange}
        />
        <input
          type="text"
          className="input"
          name="url"
          value={form.url}
          placeholder="Socket Route"
          onChange={handleChange}
        />
        <button type="submit" className="btn">
          CONNECT!
        </button>
      </form>
      {isConnected && (
        <div className="listing">
          <form className="send" onSubmit={handleSendEvent}>
            <textarea
              rows={4}
              value={sendEvent}
              onChange={(e) => setSendEvent(e.target.value)}
            />
            <button type="submit" disabled={!sendEvent}>
              Send event
            </button>
          </form>
          <div className="received">
            {logs.map((value, i) => (
              <pre key={i}>{JSON.stringify(value, 0, 2)}</pre>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

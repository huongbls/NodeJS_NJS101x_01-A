import React, { useEffect, useState } from "react";
import "./Chat.css";
import queryString from "query-string";

import ChatRoomsAPI from "../API/ChatRoomsAPI";
import { useSelector } from "react-redux";

import io from "socket.io-client";
// const socket = io("http://54.254.177.24:5000", { transports: ["websocket"] });
const socket = io("http://localhost:5000");

function Chat(props) {
  const [activeChat, setActiveChat] = useState(true);
  const [textMessage, setTextMessage] = useState("");
  const [message, setMessage] = useState();
  const [roomId, setRoomId] = useState("");
  const [chatroom, setChatroom] = useState([]);

  //Get id_user từ redux khi user đã đăng nhập
  const [load, setLoad] = useState(false);

  // Hàm này dùng để mở hộp thoại chat
  // const onChat = () => {
  //   setActiveChat(!activeChat);
  // };

  const onChangeText = (e) => {
    setTextMessage(e.target.value);
  };

  const handlerSend = async () => {
    //Sau đó nó emit dữ liệu lên server bằng socket với key send_message và value data
    // Check if text equal "/end" then end room
    if (roomId && textMessage.toLowerCase() === "/end") {
      await ChatRoomsAPI.addMessage({
        message: "==END ROOM==",
        roomId: roomId,
        is_admin: true,
      });
      //   localStorage.removeItem("njs_asm3_roomId");
      setTextMessage("");
      //   setRoomId("");
      //   setMessage([]);
      //   setActiveChat(false);
      return;
    }
    // Check if roomId is null then create new Room
    // if (!roomId) {
    //   const newRoomData = await ChatRoomsAPI.createNewRoom();
    //   setRoomId(newRoomData._id);
    //   localStorage.setItem("njs_asm3_roomId", newRoomData._id);
    // }
    const data = {
      message: textMessage,
      roomId: roomId,
      is_admin: true,
    };
    //Tiếp theo nó sẽ postdata lên api đưa dữ liệu vào database
    await ChatRoomsAPI.addMessage(data);
    setTextMessage("");
    setTimeout(() => {
      setLoad(true);
      socket.emit("send_message", data);
    }, 200);
  };

  const detailChatroom = (e) => {
    console.log(e.target.value);
    setRoomId(e.target.value);
  };

  console.log("roomId", roomId);

  const fetchChatroom = async () => {
    const response = await ChatRoomsAPI.getAllChatroom();
    setChatroom(response);
  };

  useEffect(() => {
    fetchChatroom();
  }, [chatroom]);

  // console.log(chatroom);

  const fetchData = async () => {
    if (roomId) {
      const response = await ChatRoomsAPI.getMessageByRoomId(roomId);
      setMessage(response);
    }
  };
  console.log("message", message);

  // Hàm này dùng để load dữ liệu message của user khi user gửi tin nhán
  useEffect(() => {
    if (load) {
      fetchData();
      setLoad(false);
    }
  }, [load]);

  useEffect(() => {
    setLoad(true);
  }, [roomId]);

  //Hàm này dùng để nhận socket từ server gửi lên
  useEffect(() => {
    //Nhận dữ liệu từ server gửi lên thông qua socket với key receive_message
    socket.on("receive_message", (data) => {
      //Sau đó nó sẽ setLoad gọi lại hàm useEffect lấy lại dữ liệu
      setLoad(true);
    });
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="card bg-light col-md-4 col-sm-12">
          <div className="card-body text-left">
            <form>
              <input type="search" placeholder="Search Contact" />
            </form>
            {chatroom.map((value) => (
              <div className="media media-chat pt-3" key={value._id}>
                <img
                  className="avatar"
                  src="https://img.icons8.com/color/36/000000/administrator-male.png"
                  alt="..."
                />
                <button
                  onClick={detailChatroom}
                  className="btn text-info"
                  value={value._id}
                  data-abc="true"
                >
                  {value._id}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="card bg-white border border-light col-md-8 col-sm-12">
          <div className="card-body text-left">
            <div
              className="ps-container ps-theme-default ps-active-y fix_scoll"
              // className="ps-container ps-theme-default ps-active-y fix_scoll"
            >
              {message &&
                message.map((value) =>
                  !value.is_admin ? (
                    <div className="media media-chat" key={value.id}>
                      {" "}
                      <img
                        className="avatar"
                        src="https://img.icons8.com/color/36/000000/administrator-male.png"
                        alt="..."
                      />
                      <div className="media-body" key={value.id}>
                        <p>Client: {value.message}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="media media-chat media-chat-reverse"
                      key={value.id}
                    >
                      <div className="media-body">
                        <p>You: {value.message}</p>
                      </div>
                    </div>
                  )
                )}
            </div>
            <div className="publisher bt-1 border-light">
              <input
                type="text"
                placeholder="Type and Enter"
                onChange={onChangeText}
                value={textMessage}
                style={{ width: "80%" }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handlerSend();
                  }
                }}
              />
              <a
                onClick={handlerSend}
                className="publisher-btn text-info"
                data-abc="true"
              >
                <i className="fa fa-paper-plane"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;

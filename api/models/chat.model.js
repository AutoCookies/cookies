import mongoose from "mongoose";
// Một Chat có nhiều Message, một message chỉ thuộc về một Chat. 
// Một Chat có nhiều User, một User có thể tham gia nhiều Chat.

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    }
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;

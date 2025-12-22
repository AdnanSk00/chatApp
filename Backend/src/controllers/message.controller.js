import cloudinary from '../lib/cloudinary.js';
import { createMessage, fetchMessages, getMessages } from '../models/Message.js';
import { findUserById, getAllUsers, getUsersByIds } from '../models/User.js';

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const contacts = await getAllUsers(loggedInUserId);
    res.status(200).json(contacts);
  } catch (error) {
    console.log('Error in getAllContacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user.id;
        const { id: userToChatId } = req.params;

        const messages = await getMessages(myId, userToChatId);
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error"});
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user.id;

        if(!text && !image) {
            return res.status(400).json({ message: "Text or image is required."});
        }

        if (String(senderId) === String(receiverId)) {
            return res.status(400).json({ message: "Cannot send message to yourself." });
        }

        const receiverExists = await findUserById(receiverId);
        if(!receiverExists) {
            return res.status(404).json({ message: "Receiver not found." });
        }

        let imageUrl;
        if(image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await createMessage({ senderId, receiverId, text, image: imageUrl });

         // todo: send message in real-time if user is online - socket.io

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error"});
    }
}

// find all the messages where the logged-in user is either sender or receiver
export const getChatPartners = async (req, res) => {
  try{
    const loggedInUserId = req.user.id;
    // fetch messages for the logged-in user
    const messages = await fetchMessages(loggedInUserId);

    const chatPartnerIds = [
        ...new Set(
            messages.map((msg) =>
                String(msg.senderid) === String(loggedInUserId) ? String(msg.receiverid) : String(msg.senderid)
            )
        )
    ];

    // remove any falsy values
    const partnerIdsFiltered = chatPartnerIds.filter(Boolean);

    const chatPartners = partnerIdsFiltered.length === 0 ? [] : await getUsersByIds(partnerIdsFiltered);

    res.status(200).json(chatPartners);

  } catch (error) {
    console.log("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error"});
  }
};


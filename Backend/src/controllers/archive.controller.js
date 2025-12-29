import { addArchivedChat, removeArchivedChat, getArchivedChats } from '../models/User.js';
import { findUserById } from '../models/User.js';
import { io, getReceiverSocketId } from '../lib/socket.js';

export const archiveUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: partnerId } = req.params;

    if (String(userId) === String(partnerId)) {
      return res.status(400).json({ message: "Cannot archive yourself" });
    }

    const partnerExists = await findUserById(partnerId);
    if (!partnerExists) return res.status(404).json({ message: 'Partner not found' });

    const updated = await addArchivedChat(userId, partnerId);

    // notify the user's connected socket(s)
    const socketId = getReceiverSocketId(String(userId));
    if (socketId) {
      io.to(socketId).emit('archivedUpdated', { archivedChats: updated });
    }

    res.status(200).json({ archivedChats: updated });
  } catch (error) {
    console.error('Error archiving user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unarchiveUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: partnerId } = req.params;

    const updated = await removeArchivedChat(userId, partnerId);

    const socketId = getReceiverSocketId(String(userId));
    if (socketId) {
      io.to(socketId).emit('archivedUpdated', { archivedChats: updated });
    }

    res.status(200).json({ archivedChats: updated });
  } catch (error) {
    console.error('Error unarchiving user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyArchived = async (req, res) => {
  try {
    const userId = req.user.id;
    const archived = await getArchivedChats(userId);
    res.status(200).json({ archivedChats: archived });
  } catch (error) {
    console.error('Error getting archived list:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
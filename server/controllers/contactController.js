const Contact = require("../models/Contact");

// Get all contacts
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

// Get single contact
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch contact" });
  }
};

// Create contact
const createContact = async (req, res) => {
  try {
    const { name, email, phone, company, jobTitle, address } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Name, email, and phone are required",
      });
    }

    const existingContact = await Contact.findOne({ email });

    if (existingContact) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      company,
      jobTitle,
      address,
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: "Failed to create contact" });
  }
};

// Update contact
const updateContact = async (req, res) => {
  try {
    const { name, email, phone, company, jobTitle, address } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.name = name || contact.name;
    contact.email = email || contact.email;
    contact.phone = phone || contact.phone;
    contact.company = company || "";
    contact.jobTitle = jobTitle || "";
    contact.address = address || "";

    const updatedContact = await contact.save();
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: "Failed to update contact" });
  }
};

// Delete contact
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await contact.deleteOne();
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete contact" });
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
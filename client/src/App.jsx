import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "https://contact-manager-backend-6yvg.onrender.com/api/contacts";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  address: "",
};

function App() {
  const [formData, setFormData] = useState(initialFormData);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL);
      setContacts(response.data);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setFormError("Failed to load contacts. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setFormError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Full name is required.";
    }

    if (!formData.email.trim()) {
      return "Email address is required.";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      return "Phone number is required.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      setSuccessMessage("");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");
      setSuccessMessage("");

      if (editingId) {
        const response = await axios.put(`${API_URL}/${editingId}`, formData);

        setContacts((prev) =>
          prev.map((contact) =>
            contact._id === editingId ? response.data : contact
          )
        );

        setSuccessMessage("Contact updated successfully.");
      } else {
        const response = await axios.post(API_URL, formData);
        setContacts((prev) => [response.data, ...prev]);
        setSuccessMessage("Contact added successfully.");
      }

      resetForm();
    } catch (error) {
      console.error("Failed to save contact:", error);
      setSuccessMessage("");
      setFormError(error.response?.data?.message || "Failed to save contact.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (contact) => {
    setEditingId(contact._id);
    setFormError("");
    setSuccessMessage("");

    setFormData({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      jobTitle: contact.jobTitle || "",
      address: contact.address || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setContacts((prev) => prev.filter((contact) => contact._id !== id));

      if (editingId === id) {
        resetForm();
      }

      setSuccessMessage("Contact deleted successfully.");
      setFormError("");
    } catch (error) {
      console.error("Failed to delete contact:", error);
      setFormError("Failed to delete contact.");
      setSuccessMessage("");
    }
  };

  const filteredContacts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return contacts;

    return contacts.filter((contact) => {
      return (
        contact.name.toLowerCase().includes(keyword) ||
        contact.email.toLowerCase().includes(keyword) ||
        contact.phone.toLowerCase().includes(keyword) ||
        contact.company?.toLowerCase().includes(keyword) ||
        contact.jobTitle?.toLowerCase().includes(keyword) ||
        contact.address?.toLowerCase().includes(keyword)
      );
    });
  }, [contacts, searchTerm]);

  const totalContactsLabel = `${contacts.length} ${
    contacts.length === 1 ? "Contact" : "Contacts"
  }`;

  const filteredContactsLabel = `${filteredContacts.length} ${
    filteredContacts.length === 1 ? "Result" : "Results"
  }`;

  return (
    <div className="app">
      <header className="header">
        <span className="eyebrow">Professional Contact Dashboard</span>
        <h1>Contact Manager</h1>
        <p>
          Organize, search, update, and manage your professional contacts in one
          clean modern workspace.
        </p>
      </header>

      <main className="container">
        <section className="card">
          <div className="section-header">
            <div>
              <h2>{editingId ? "Edit Contact" : "Add New Contact"}</h2>
              <p className="section-subtext">
                {editingId
                  ? "Update the selected contact details."
                  : "Create a new contact with complete professional details."}
              </p>
            </div>
            <span className="badge">{editingId ? "Update" : "Create"}</span>
          </div>

          {formError && <div className="message message-error">{formError}</div>}
          {successMessage && (
            <div className="message message-success">{successMessage}</div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  placeholder="Enter company name"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  placeholder="Enter job title"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group form-group-full">
                <label>Address</label>
                <textarea
                  name="address"
                  placeholder="Enter address"
                  rows="4"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="btn-content">
                    <span className="spinner"></span>
                    {editingId ? "Updating..." : "Adding..."}
                  </span>
                ) : editingId ? (
                  "Update Contact"
                ) : (
                  "Add Contact"
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>Your Contacts</h2>
              <p className="section-subtext">
                {searchTerm ? filteredContactsLabel : totalContactsLabel}
              </p>
            </div>
            <span className="badge badge-soft">{totalContactsLabel}</span>
          </div>

          <div className="search-wrap">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, phone, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="empty-state">
              <div className="state-visual state-loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div>
                <h3>Loading contacts...</h3>
                <p>Please wait a moment while your contact list is prepared.</p>
              </div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">
              <div className="state-visual">👥</div>
              <div>
                <h3>No contacts yet</h3>
                <p>
                  Start by adding your first contact from the form on the left.
                </p>
              </div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="empty-state">
              <div className="state-visual">🔍</div>
              <div>
                <h3>No matching contacts</h3>
                <p>Try another keyword or clear your search.</p>
              </div>
            </div>
          ) : (
            <div className="contact-list">
              {filteredContacts.map((contact) => (
                <div className="contact-item" key={contact._id}>
                  <div className="contact-top">
                    <div>
                      <h3>{contact.name}</h3>
                      <p>{contact.email}</p>
                    </div>

                    <div className="contact-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(contact)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(contact._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="contact-meta">
                    <span>{contact.phone}</span>
                    {contact.company && <span>{contact.company}</span>}
                    {contact.jobTitle && <span>{contact.jobTitle}</span>}
                  </div>

                  {contact.address && (
                    <p className="contact-address">{contact.address}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
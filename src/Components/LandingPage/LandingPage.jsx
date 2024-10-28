import { useState, useEffect } from "react";
import React from "react";
import "../LandingPage/LandingPage.css";
import { CiSearch } from "react-icons/ci";
import {
  FaAngleDown,
  FaAngleUp,
  FaTrashAlt,
  FaEdit,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import users from "../../celebrities.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LandingPage() {
  const [openAccordion, setOpenAccordion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [userData, setUserData] = useState(() => {
    const savedData = localStorage.getItem("userData");
    return savedData ? JSON.parse(savedData) : users;
  });
  const [editData, setEditData] = useState({});
  const [editedFields, setEditedFields] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

    // Save user data to localStorage whenever it changes
    useEffect(() => {
      localStorage.setItem("userData", JSON.stringify(userData));
    }, [userData]);

  const toggleAccordion = (id) => {
    if (editingUserId !== null) {
      return;
    }
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const startEditing = (id) => {
    setEditingUserId(id);
    const currentUser = userData.find((user) => user.id === id);
    setEditData({ ...currentUser });
    setEditedFields({});
  };

  const saveChanges = () => {
    setUserData((prevData) =>
      prevData.map((user) =>
        user.id === editingUserId ? { ...user, ...editData } : user
      )
    );
    toast.success("Changes saved successfully!");
    setEditingUserId(null);
  };

  const cancelChanges = () => {
    setEditingUserId(null);
  };

  const handleInputChange = (field, value) => {
    setEditData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    setEditedFields((prev) => ({ ...prev, [field]: true }));
  };

  const filteredUsers = userData.filter((user) =>
    `${user.first} ${user.last}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  function ageToDob(age) {
    const today = new Date();
    return new Date(
      today.getFullYear() - age,
      today.getMonth(),
      today.getDate()
    )
      .toISOString()
      .slice(0, 10);
  }

  const handleDelete = (id) => {
    setShowDeleteModal(true);
    setUserToDelete(id);
  };

  const confirmDelete = () => {
    setUserData((prevData) =>
      prevData.filter((user) => user.id !== userToDelete)
    );
    toast.success("User deleted successfully!");
    setShowDeleteModal(false);
    setUserToDelete(null);
    if (openAccordion === userToDelete) {
      setOpenAccordion(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const accordionElements = document.querySelectorAll(".accordion");

      const isOutside = !Array.from(accordionElements).some((element) =>
        element.contains(event.target)
      );

      if (isOutside && editingUserId !== null) {
        if (Object.keys(editedFields).length > 0) {
          const confirmClose = window.confirm(
            "You have unsaved changes. Are you sure you want to discard them?"
          );
          if (confirmClose) {
            cancelChanges();
          }
        } else {
          cancelChanges();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingUserId, editedFields]);

  return (
    <div className="container">
      <div
        className={
          showDeleteModal ? "background-content blur" : "background-content"
        }
      >
        <h1 className="check">List View</h1>
        <div className="search-container">
          <span className="search-icon">
            <CiSearch size={25} />
          </span>

          <input
            type="search"
            name="user-search"
            placeholder="Search User"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredUsers.map((user) => (
          <div key={user.id} className="accordion">
            <div className="accordion-header">
              <img
                src={user.picture}
                alt={`${user.first} ${user.last}`}
                className="accordion-image"
              />
              <span className="accordion-name">
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    value={`${editData.first} ${editData.last}`}
                    onChange={(e) => {
                      const [first, ...last] = e.target.value.split(" ");
                      handleInputChange("first", first);
                      handleInputChange("last", last.join(" "));
                    }}
                    className="edit-input-name"
                    placeholder="First Last"
                  />
                ) : (
                  `${user.first} ${user.last}`
                )}
              </span>

              <span
                className="accordion-icon"
                onClick={() => toggleAccordion(user.id)}
              >
                {openAccordion === user.id ? (
                  <FaAngleUp size={25} />
                ) : (
                  <FaAngleDown size={25} />
                )}
              </span>
            </div>
            {openAccordion === user.id && (
              <div className="accordion-content">
                <div>
                  <p>
                    <strong>Age</strong>{" "}
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={calculateAge(editData.dob)}
                        onChange={(e) =>
                          handleInputChange("dob", ageToDob(e.target.value))
                        }
                        className="edit-input-mid"
                      />
                    ) : (
                      <span className="text-clr">
                        {calculateAge(user.dob)} Years
                      </span>
                    )}
                  </p>

                  <p>
                    <strong>Gender</strong>{" "}
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editData.gender}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        className="edit-input-mid"
                      />
                    ) : (
                      <span className="text-clr">{user.gender}</span>
                    )}
                  </p>
                  <p>
                    <strong>Country</strong>{" "}
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editData.country}
                        onChange={(e) =>
                          handleInputChange("country", e.target.value)
                        }
                        className="edit-input-mid"
                      />
                    ) : (
                      <span className="text-clr">{user.country}</span>
                    )}
                  </p>
                </div>
                <p className="description">
                  <strong>Description</strong>{" "}
                  {editingUserId === user.id ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="edit-input-des"
                    />
                  ) : (
                    <span className="text-clr">{user.description}</span>
                  )}
                </p>
                <div className="action-icons">
                  {editingUserId === user.id ? (
                    <>
                      <FaTimes
                        className="cancel-icon"
                        onClick={cancelChanges}
                      />
                      <FaCheck className="save-icon" onClick={saveChanges} />
                    </>
                  ) : (
                    <>
                      <FaTrashAlt
                        className="del-icon"
                        onClick={() => handleDelete(user.id)}
                      />
                      <FaEdit
                        className="edit-icon"
                        onClick={() => startEditing(user.id)}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Are you sure you want to delete?</h2>
              <button className="close-icon" onClick={cancelDelete}>
                &times;
              </button>
            </div>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="btn-cancel">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn-confirm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default LandingPage;

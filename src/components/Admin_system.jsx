import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./../App2.css";
import { Button, Space, Table, Typography } from "antd";
import dayjs from "dayjs";
import DetailsDrawer from "./DetailsDrawer";

// axios.defaults.baseURL = 'http://localhost:5001';

const Admin_system = () => {
  const [newObjects, setNewObjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [projectUrl, setProjectUrl] = useState("");
  const [projectLeader, setProjectLeader] = useState("");
  const [action, setAction] = useState("");
  const [refusalReason, setRefusalReason] = useState("");
  const [refusalInputFor, setRefusalInputFor] = useState(null); // ID de l'objet pour lequel afficher le champ de saisie
  const [currentDetailId, setCurrentDetailId] = useState(null); // ID de la demande actuellement affichée dans le modal
  const [message, setMessage] = useState(""); // Message indiquant le nombre de nouvelles demandes
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [usersList, setUsersList] = useState([]);

  const columns = [
    {
      title: "Soumis le",
      render: (_, record) => (
        <>{dayjs(record?.date_demande).format("DD/MM/YYYY HH:mm")}</>
      ),
    },
    {
      title: "ID Demande",
      dataIndex: "_id",
    },
    {
      title: "ID Projet",
      dataIndex: "project_id",
    },
    {
      title: "Nom Projet",
      dataIndex: "nom",
    },
    {
      title: "Chef de Projet",
      dataIndex: "project_leader",
    },
    {
      title: "Tag",
      dataIndex: "tag",
    },
    {
      title: "date de prod",
      dataIndex: "date_de_prod",
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <DetailsDrawer
            record={record}
            handleApprove={handleApprove}
            handleRefuse={handleRefuse}
            setRefusalReason={setRefusalReason}
            handleSendRefusal={handleSendRefusal}
            refusalReason={refusalReason}
            refusalInputFor={refusalInputFor}
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const savedDemands = JSON.parse(localStorage.getItem("newObjects")) || [];

    setNewObjects(savedDemands);
    axios
      .get("http://localhost:5001/check_collection")
      .then((response) => {
        if (response.data && response.data.new_objects) {
          // Marquer les nouvelles demandes et ajouter un timestamp
          const newDemands = response.data.new_objects.map((demand) => ({
            ...demand,
            isNew: true,
            timestamp: Date.now(),
          }));
          const combinedDemands = [...newDemands, ...savedDemands];
          setNewObjects(response.data.new_objects);
          localStorage.setItem("newObjects", JSON.stringify(combinedDemands)); // Sauvegarder dans localStorage
          toast.info(
            `Il y a ${response.data.new_objects.length} nouvelles demandes.`
          );
          setMessage(
            `Il y a ${response.data.new_objects.length} nouvelles demandes.`
          );
        }
      })
      .catch((error) => console.error(error));
  }, []);


  useEffect(() => {
    // Appel à l'endpoint get_users pour récupérer la liste des utilisateurs
    axios.get('http://localhost:5001/get_users')
      .then((response) => {
        if (response.data) {
          setUsersList(response.data); // Mettre à jour usersList avec la réponse
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const renderUserOptions = () => {
    return (
      <>
        <option value="">{/* Texte pour l'option par défaut */}Choisissez un project_leader</option>
        {usersList.map((user, index) => (
          <option key={index} value={user._id}>
            {user.nom}
          </option>
        ))}
      </>
    );
  };

  const sortedDemands = newObjects.sort(
    (a, b) => b.isNew - a.isNew || b.timestamp - a.timestamp
  );

  const handleApprove = (_id) => {
    axios
      .post("http://localhost:5002/stocker", {
        _id: _id,
        message: "Demande approuvée",
      })
      .then(() => {
        // Supprimer l'objet approuvé du tableau
        const updatedObjects = newObjects.filter((obj) => obj._id !== _id);
        setNewObjects(updatedObjects);
        localStorage.setItem("newObjects", JSON.stringify(updatedObjects));
      })
      .catch((error) => console.error(error));
  };

  const handleRefuse = (_id) => {
    setRefusalInputFor(_id); // Afficher le champ de saisie pour cet ID
  };

  const handleSendRefusal = (_id) => {
    if (refusalReason !== "") {
      axios
        .post("http://localhost:5002/stocker", {
          _id: _id,
          message: "Demande refusée: " + refusalReason,
        })
        .then(() => {
          setRefusalReason("");
          setRefusalInputFor(null); // Masquer le champ de saisie
          // Supprimer l'objet refusé du tableau
          const updatedObjects = newObjects.filter((obj) => obj._id !== _id);
          setNewObjects(updatedObjects);
          localStorage.setItem("newObjects", JSON.stringify(updatedObjects));
        })
        .catch((error) => console.error(error));
    }
  };

  const handleAction = (selectedAction) => {
    // Si l'action sélectionnée est la même que celle en cours et que les champs sont visibles, les cacher
    if (action === selectedAction && isInputVisible) {
      setIsInputVisible(false);
      setAction("");
    } else {
      // Sinon, afficher les champs et définir l'action
      setIsInputVisible(true);
      setAction(selectedAction);
    }
  };

  useEffect(() => {
    console.log(sortedDemands);
  }, [sortedDemands]);

  const handleActionSubmit = () => {
    switch (action) {
      case "add":
        handleAddProject();
        break;
      case "delete":
        handleDeleteProject();
        break;
      case "modify":
        handleModifyProject();
        break;
      default:
        break;
    }
  };

  const handleAddProject = () => {
    axios
      .post("http://localhost:5001/ajouter_projet", {
        project_url: projectUrl,
        project_leader: projectLeader,
      })
      .then((response) => {
        toast.success(`Projet ajouté : ${response.data.message}`);
        console.log(response.data);
      })
      .catch((error) => {
        toast.error(`Erreur lors de l'ajout du projet : ${error.response.data.message}`);
        console.error(error);
      });
  };

  const handleDeleteProject = () => {
    axios
      .post("http://localhost:5001/supprimer_projet", {
        project_url: projectUrl,
      })
      .then((response) => {
        toast.success(`Projet supprimé : ${response.data.message}`);
        console.log(response.data);
      })
      .catch((error) => {
        toast.error(`Erreur lors de la suppression du projet : ${error.response.data.message}`);
        console.error(error);
      });
  };

  const handleModifyProject = () => {
    axios
      .post("http://localhost:5001/modifier_projet", {
        project_url: projectUrl,
        project_leader: projectLeader,
      })
      .then((response) => {
        toast.success(`Projet modifié : ${response.data.message}`);
        console.log(response.data);
      })
      .catch((error) => {
        toast.error(`Erreur lors de la modification du projet : ${error.response.data.message}`);
        console.error(error);
      });
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <div>
      <div>
        <Typography.Title level={3}> Gestion de la base </Typography.Title>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div>
            <Button
              size="large"
              type="primary"
              onClick={() => handleAction("add")}
            >
              Ajouter Projet
            </Button>
          </div>
          <div>
            <Button
              size="large"
              type="primary"
              onClick={() => handleAction("delete")}
            >
              Supprimer Projet
            </Button>
          </div>
          <div>
            <Button
              size="large"
              type="primary"
              onClick={() => handleAction("modify")}
            >
              Modifier Projet
            </Button>
          </div>
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "13px",
            padding: 10,
            backgroundColor: "#F5F5F5",
          }}
        >
          {action === "modify" && isInputVisible && (
            <>
              <label>
                {" "}
                <br />
                URL du projet:
                <input
                  type="text"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                />
              </label>
              <label>
                Chef de projet:
                <select
                  value={projectLeader}
                  onChange={(e) => setProjectLeader(e.target.value)}
                >
                  {renderUserOptions()}
                </select>
              </label>
              <Button
                onClick={handleActionSubmit}
                disabled={!projectUrl || !projectLeader}
              >
                Envoyer
              </Button>
            </>
          )}
          {action === "add" && isInputVisible && (
            <>
              <label>
                {" "}
                <br />
                URL du projet:
                <input
                  type="text"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                />
              </label>
              <label>
                Chef de projet:
                <select
                  value={projectLeader}
                  onChange={(e) => setProjectLeader(e.target.value)}
                >
                  {renderUserOptions()}
                </select>
              </label>
              <Button
                onClick={handleActionSubmit}
                disabled={!projectUrl || !projectLeader}
              >
                Envoyer
              </Button>
            </>
          )}
          {action === "delete" && isInputVisible && (
            <>
              <label>
                {" "}
                <br />
                URL du projet:
                <input
                  type="text"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                />
              </label>
              <Button onClick={handleActionSubmit} disabled={!projectUrl}>
                Envoyer
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="">
        <ToastContainer position="top-right" autoClose={5000} />
        <Typography.Title level={3}>
          Gestion des demandes de produdction
        </Typography.Title>
        <Table
          columns={columns}
          scroll={{ x: "max-content" }}
          dataSource={sortedDemands}
        />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Admin_system;
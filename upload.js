const admin = require("firebase-admin");
const axios = require("axios");
const fs = require("fs");

// Initialiser Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json"); // Remplacez par le chemin vers votre fichier de clé privée

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Télécharger le fichier JSON depuis l'URL
const fetchJsonData = async (url) => {
  try {
    const response = await axios.get(url);
    console.log("JSON data fetched successfully.");
    return response.data;
  } catch (error) {
    console.error("Error fetching JSON data:", error);
    throw error;
  }
};

// Charger les données dans Firestore
const uploadToFirestore = async (data) => {
  try {
    for (const collectionName in data) {
      const documents = data[collectionName];
      console.log(`Processing collection: ${collectionName}`);

      for (const docId in documents) {
        const docData = documents[docId];
        await db.collection(collectionName).doc(docId).set(docData);
        console.log(`Document ${docId} added to ${collectionName} collection.`);
      }
    }
    console.log("Data upload complete.");
  } catch (error) {
    console.error("Error uploading data:", error);
  }
};

async function deleteCollectionRecursively(collectionRef) {
  // Récupère tous les documents de la collection
  const snapshot = await collectionRef.get();

  const deletePromises = [];
  for (const doc of snapshot.docs) {
    // Supprime récursivement toutes les sous-collections de ce document
    const subCollections = await doc.ref.listCollections();
    for (const subCollection of subCollections) {
      await deleteCollectionRecursively(subCollection);
    }

    // Supprime le document lui-même
    deletePromises.push(doc.ref.delete());
  }

  // Attendre que tous les documents de la collection soient supprimés
  await Promise.all(deletePromises);
}

async function deleteGroupsIfExist() {
  const groupsCollection = db.collection("Groups");

  // Vérifie si la collection existe et supprime récursivement
  const snapshot = await groupsCollection.get();
  if (!snapshot.empty) {
    console.log(
      "La collection Groups existe, suppression des documents et sous-collections..."
    );
    await deleteCollectionRecursively(groupsCollection);
    console.log(
      "Tous les documents et sous-collections de la collection Groups ont été supprimés."
    );
  }
}

// Permet d'avoir les groupes 4
function groupByDepartementAndDanceAndVilleAndLevel(data) {
  const groupedByDepartement = {};

  data.forEach((departement) => {
    if (!groupedByDepartement[departement.name]) {
      groupedByDepartement[departement.name] = {};
    }

    departement.villes.forEach((ville) => {
      ville.danses.forEach((danse) => {
        if (!groupedByDepartement[departement.name][danse.name]) {
          groupedByDepartement[departement.name][danse.name] = {};
        }

        if (!groupedByDepartement[departement.name][danse.name][ville.name]) {
          groupedByDepartement[departement.name][danse.name][ville.name] = {};
        }

        danse.cours.forEach((cours) => {
          if (
            !groupedByDepartement[departement.name][danse.name][ville.name][
              cours.niveau
            ]
          ) {
            groupedByDepartement[departement.name][danse.name][ville.name][
              cours.niveau
            ] = [];
          }

          groupedByDepartement[departement.name][danse.name][ville.name][
            cours.niveau
          ].push({
            danceName: danse.name,
            ville: ville.name,
            niveau: cours.niveau,
            horaire: cours.horaire,
            adresse: cours.adresse,
            professeur: cours.professeur.professeurName,
            reprise: cours.reprise,
            image: danse.image,
          });
        });
      });
    });
  });

  return groupedByDepartement;
}

// Permet d'avoir les groupes 3
function groupByDepartementAndDanceAndVille(data) {
  const groupedByDepartement = {};

  data.forEach((departement) => {
    if (!groupedByDepartement[departement.name]) {
      groupedByDepartement[departement.name] = {};
    }

    departement.villes.forEach((ville) => {
      ville.danses.forEach((danse) => {
        if (!groupedByDepartement[departement.name][danse.name]) {
          groupedByDepartement[departement.name][danse.name] = {};
        }

        if (!groupedByDepartement[departement.name][danse.name][ville.name]) {
          groupedByDepartement[departement.name][danse.name][ville.name] = [];
        }

        danse.cours.forEach((cours) => {
          groupedByDepartement[departement.name][danse.name][ville.name].push({
            danceName: danse.name,
            ville: ville.name,
            horaire: cours.horaire,
            adresse: cours.adresse,
            professeur: cours.professeur.professeurName,
            reprise: cours.reprise,
            niveau: cours.niveau,
            image: ville.image,
          });
        });
      });
    });
  });

  return groupedByDepartement;
}

// Permet d'avoir les groupes 2 rouges
function groupByDepartementAndVille(data) {
  const groupedByDepartement = {};

  data.forEach((departement) => {
    if (!groupedByDepartement[departement.name]) {
      groupedByDepartement[departement.name] = {};
    }

    departement.villes.forEach((ville) => {
      if (!groupedByDepartement[departement.name][ville.name]) {
        groupedByDepartement[departement.name][ville.name] = [];
      }

      ville.danses.forEach((danse) => {
        danse.cours.forEach((cours) => {
          groupedByDepartement[departement.name][ville.name].push({
            danceName: danse.name,
            ville: ville.name,
            niveau: cours.niveau,
            horaire: cours.horaire,
            adresse: cours.adresse,
            professeur: cours.professeur.professeurName,
            reprise: cours.reprise,
            image: ville.image,
          });
        });
      });
    });
  });

  return groupedByDepartement;
}

// Permet d'avoir les groupes 2 jaunes
function groupByDepartementAndDance(data) {
  const groupedByDepartement = {};

  data.forEach((departement) => {
    if (!groupedByDepartement[departement.name]) {
      groupedByDepartement[departement.name] = {};
    }

    departement.villes.forEach((ville) => {
      ville.danses.forEach((danse) => {
        if (!groupedByDepartement[departement.name][danse.name]) {
          groupedByDepartement[departement.name][danse.name] = [];
        }

        danse.cours.forEach((cours) => {
          groupedByDepartement[departement.name][danse.name].push({
            danceName: danse.name,
            ville: ville.name,
            horaire: cours.horaire,
            adresse: cours.adresse,
            professeur: cours.professeur.professeurName,
            reprise: cours.reprise,
            niveau: cours.niveau,
            image: danse.image,
          });
        });
      });
    });
  });

  return groupedByDepartement;
}

// Permet d'avoir les groupes 1
function groupByDepartment(data) {
  const groupedByDepartment = {};

  data.forEach((departement) => {
    if (!groupedByDepartment[departement.name]) {
      groupedByDepartment[departement.name] = [];
    }
    departement.villes.forEach((ville) => {
      if (Array.isArray(ville.danses)) {
        ville.danses.forEach((danse) => {
          danse.cours.forEach((cours) => {
            groupedByDepartment[departement.name].push({
              departement: departement.name,
              ville: ville.name,
              danse: danse.name,
              horaire: cours.horaire,
              adresse: cours.adresse,
              professeur: cours.professeur.professeurName,
              reprise: cours.reprise,
              niveau: cours.niveau,
              image: departement.imageDepartement,
            });
          });
        });
      }
    });
  });

  return groupedByDepartment;
}

function countOccurences(ville, tab) {
  let cnt = 0;
  for (const dance of tab) {
    if (ville in dance) {
      cnt++;
    }
  }
  return cnt;
}

// Fonction principale pour regrouper toutes les données
function groupData(data) {
  const groupedByDepartment = groupByDepartment(data);
  const groupedByDepartementAndDance = groupByDepartementAndDance(data);
  const groupedByDepartementAndVille = groupByDepartementAndVille(data);
  const groupedByDepartementAndDanceAndVille =
    groupByDepartementAndDanceAndVille(data);
  const groupedByDepartementAndDanceAndVilleAndLevel =
    groupByDepartementAndDanceAndVilleAndLevel(data);

  return {
    groupedByDepartment,
    groupedByDepartementAndDance,
    groupedByDepartementAndDanceAndVille,
    groupedByDepartementAndDanceAndVilleAndLevel,
    groupedByDepartementAndVille,
  };
}

function createGroup({ groupName, groupPictureUrl, hauteur }) {
  return {
    groupName,
    groupPictureUrl,
    groupMembersHashedId: [],
    hauteur: hauteur,
    lastMessageId: "",
    publicationsId: [],
    eventsId: [],
    groupRequestHashedId: [],
  };
}

// Main function
const main = async () => {
  const jsonUrl =
    "https://raw.githubusercontent.com/neo-schobert/SalsaDeRuePublicInfos/refs/heads/master/datas.json";

  try {
    // Télécharger et charger les données JSON
    const jsonData = await fetchJsonData(jsonUrl);

    const groupedData = groupData(jsonData.secteurs);

    fs.writeFileSync("resultat.json", JSON.stringify(groupedData, null, 2));
    await deleteGroupsIfExist();
    const groups = [
      // createGroup({
      //   groupName: "SDR France",
      //   groupPictureUrl:
      //     "https://github.com/neo-schobert/SalsaDeRuePublicInfos/blob/master/images/france.png?raw=true",
      //   hauteur: 0,
      // }),
    ];

    const groupsCollection = db.collection("Groups");

    if (Object.keys(groupedData.groupedByDepartment).length > 1) {
      for (const secteur of Object.values(groupedData.groupedByDepartment)) {
        const groupName = "SDR " + secteur[0].departement;
        const groupPictureUrl =
          "https://github.com/neo-schobert/SalsaDeRuePublicInfos/blob/master" +
          secteur[0].image.replace(/^\./, "") +
          "?raw=true";
        const newGroup = createGroup({
          groupName,
          groupPictureUrl,
          hauteur: 1,
        });
        groups.push(newGroup);

        groupsCollection.doc(secteur[0].departement).set(newGroup);
      }
    }

    console.log("Documents départements ajoutés avec succès.");

    for (const secteur of Object.keys(
      groupedData.groupedByDepartementAndDance
    )) {
      if (
        Object.keys(groupedData.groupedByDepartementAndDance[secteur]).length >
        1
      ) {
        for (const dance of Object.values(
          groupedData.groupedByDepartementAndDance[secteur]
        )) {
          const groupName = dance[0].danceName + " " + secteur;
          const groupPictureUrl =
            "https://github.com/neo-schobert/SalsaDeRuePublicInfos/blob/master" +
            dance[0].image.replace(/^\./, "") +
            "?raw=true";
          const newGroup = createGroup({
            groupName,
            groupPictureUrl,
            hauteur: 2,
          });
          groups.push(newGroup);

          const parDanceCollection = db
            .collection("Groups")
            .doc(secteur)
            .collection("parDance");

          parDanceCollection.doc(dance[0].danceName).set(newGroup);
        }
      }
    }

    console.log("Documents danses ajoutés avec succès.");

    for (const secteur of Object.keys(
      groupedData.groupedByDepartementAndDanceAndVille
    )) {
      for (const dance of Object.keys(
        groupedData.groupedByDepartementAndDanceAndVille[secteur]
      )) {
        if (
          Object.keys(
            groupedData.groupedByDepartementAndDanceAndVille[secteur][dance]
          ).length > 1
        ) {
          for (const ville of Object.values(
            groupedData.groupedByDepartementAndDanceAndVille[secteur][dance]
          )) {
            if (
              countOccurences(
                ville[0].ville,
                Object.values(
                  groupedData.groupedByDepartementAndDanceAndVille[secteur]
                )
              ) > 1
            ) {
              const groupName = dance + " " + ville[0].ville;
              const groupPictureUrl =
                "https://github.com/neo-schobert/SalsaDeRuePublicInfos/blob/master" +
                ville[0].image.replace(/^\./, "") +
                "?raw=true";
              const newGroup = createGroup({
                groupName,
                groupPictureUrl,
                hauteur: 3,
              });

              groups.push(newGroup);

              const parVilleCollection = db
                .collection("Groups")
                .doc(secteur)
                .collection("parDance")
                .doc(dance)
                .collection("parVille");

              parVilleCollection.doc(ville[0].ville).set(newGroup);
            }
          }
        }
      }
    }

    console.log("Documents villes ajoutés avec succès.");

    for (const secteur of Object.keys(
      groupedData.groupedByDepartementAndDanceAndVilleAndLevel
    )) {
      for (const dance of Object.keys(
        groupedData.groupedByDepartementAndDanceAndVilleAndLevel[secteur]
      )) {
        for (const ville of Object.keys(
          groupedData.groupedByDepartementAndDanceAndVilleAndLevel[secteur][
            dance
          ]
        )) {
          if (
            Object.keys(
              groupedData.groupedByDepartementAndDanceAndVilleAndLevel[secteur][
                dance
              ][ville]
            ).length > 1
          )
            for (const level of Object.values(
              groupedData.groupedByDepartementAndDanceAndVilleAndLevel[secteur][
                dance
              ][ville]
            )) {
              const groupName =
                "SDR " +
                secteur +
                " " +
                dance +
                " " +
                ville +
                " " +
                level[0].niveau;
              const groupPictureUrl =
                "https://github.com/neo-schobert/SalsaDeRuePublicInfos/blob/master" +
                level[0].image.replace(/^\./, "") +
                "?raw=true";

              const newGroup = createGroup({
                groupName,
                groupPictureUrl,
                hauteur: 4,
              });

              groups.push(newGroup);

              const parLevelCollection = db
                .collection("Groups")
                .doc(secteur)
                .collection("parDance")
                .doc(dance)
                .collection("parVille")
                .doc(ville)
                .collection("parLevel");

              const levelName = level[0].niveau.toString();

              parLevelCollection.doc(levelName).set(newGroup);
            }
        }
      }
    }

    console.log("Documents niveaux ajoutés avec succès.");

    for (const secteur of Object.keys(
      groupedData.groupedByDepartementAndVille
    )) {
      if (
        Object.keys(groupedData.groupedByDepartementAndVille[secteur]).length >
        1
      ) {
        for (const ville of Object.values(
          groupedData.groupedByDepartementAndVille[secteur]
        )) {
          const groupName = "SDR " + " " + ville[0].ville;
          const groupPictureUrl =
            "https://github.com/neo-schobert/SalsaDeRuePublicInfos/blob/master" +
            ville[0].image.replace(/^\./, "") +
            "?raw=true";
          const newGroup = createGroup({
            groupName,
            groupPictureUrl,
            hauteur: 2,
          });
          groups.push(newGroup);

          const parVilleCollection = db
            .collection("Groups")
            .doc(secteur)
            .collection("parVille");

          parVilleCollection.doc(ville[0].ville).set(newGroup);
        }
      }
    }

    console.log("Documents villes 2 ajoutés avec succès.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

// Exécuter le script
main();

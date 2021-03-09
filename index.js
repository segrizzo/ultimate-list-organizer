let db;
document.addEventListener("DOMContentLoaded", function () {
  initFireBase();
  displayLists();
});
let selectedSection = null;
function initFireBase() {
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyD7y1KzsBax5tlqnEf4-AUsW_H2pKypHCs",
    authDomain: "list-organizer-c4ce2.firebaseapp.com",
    projectId: "list-organizer-c4ce2",
    storageBucket: "list-organizer-c4ce2.appspot.com",
    messagingSenderId: "715610677765",
    appId: "1:715610677765:web:eb313d09456f9d5352f26c",
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
}
async function displayLists() {
  const querySnapshot = await db.collection("lists").orderBy("createdAt").get();
  const fetchedLists = querySnapshot.docs.map((doc) => {
    const id = doc.id;
    const data = doc.data();
    return {
      ...data,
      id,
    };
  });
  const sortByCategory = (map, currentValue) => {
    if (map.has(currentValue.category)) {
      const currentDefinition = map.get(currentValue.category);
      currentDefinition.push(currentValue);
    } else {
      map.set(currentValue.category, [currentValue]);
    }
    return map;
  };

  const listsByCategoryMap = fetchedLists.reduce(sortByCategory, new Map());
  for (let [category, lists] of listsByCategoryMap) {
    const articleclone = createSection(category, category);
    document.getElementById("mainContent").append(articleclone);
    for (let list of lists) {
      let li = createList(list);
      articleclone.querySelector("ol").append(li);
    }
  }
  initCategoriesDataList(listsByCategoryMap);
}
function openModal(formId) {
  var modal = document.getElementById(formId);
  modal.style.display = "block";
}
function closeModal(formId) {
  var modal = document.getElementById(formId);
  modal.style.display = "none";
  document.getElementById("listForm").reset();
  const input = document.getElementById("category");
  input.disabled = false;
}
function createSection(title, articleid) {
  let article = document.createElement("article");
  article.id = articleid;
  let header = document.createElement("header");
  article.append(header);
  let h2 = document.createElement("h2");
  h2.innerHTML = title;
  header.append(h2);
  let ol = document.createElement("ol");
  ol.id = title;
  let button = document.createElement("button");
  button.className = "bouton-plus";
  button.innerHTML = "+";
  button.onclick = function () {
    openModal("newListForm");
    const input = document.getElementById("category");
    input.value = articleid;
    input.disabled = true;
  };

  header.append(button);
  article.append(ol);
  return article;
}

function createListItemNode(item, type) {
  let li = document.createElement("li");

  switch (type) {
    case "todo":
      let input = document.createElement("input");
      input.checked = item.checked;
      input.type = "checkbox";
      li.append(input);
      let span = document.createElement("span");
      span.innerHTML = item.content;
      li.append(span);
      break;
    case "link":
      let link = document.createElement("a");
      link.href = item.link;
      link.innerHTML = item.content;
      li.append(link);
      break;
    case "text":
      li.innerHTML = item.content;
      break;
    default:
      alert("Type does not exist");
      break;
  }
  return li;
}

function createList(list) {
  let li = document.createElement("li");
  li.id = list.id;
  let h3 = document.createElement("h3");
  h3.innerHTML = list.title;
  li.append(h3);
  let ol = document.createElement("ol");
  li.append(ol);
  for (let listItem of list.items) {
    let liMini = createListItemNode(listItem, list.type);
    ol.append(liMini);
  }
  let button = document.createElement("button");
  button.className = "bouton-plus-content";
  button.innerHTML = "+ Ajouter";
  li.append(button);
  button.onclick = function () {
    const label = document.getElementById("newLinkWrapper");
    const formTitle = document.getElementById("listTitleNewItemForm");
    const form = document.getElementById("listItemForm");
    form.onsubmit = function (e) {
      onListItemCreation(e, list);
    };
    formTitle.innerHTML = list.title;
    if (list.type === "link") {
      label.style.display = "block";
    } else {
      label.style.display = "none";
    }
    openModal("modifListContentForm");
  };
  return li;
}
async function onListCreation(e) {
  e.preventDefault();
  const newListTitle = document.getElementById("newListTitle").value;
  const categoryTitle = document.getElementById("category").value;
  const listType = document.getElementById("type-select").value;
  let newList = {
    title: newListTitle,
    items: [],
    createdAt: new Date(),
    category: categoryTitle,
    type: listType,
  };
  try {
    const docRef = await db.collection("lists").add(newList);
    newList.id = docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    alert(error);
  }
  const freshList = createList(newList);
  const categorynode = document.getElementById(categoryTitle);
  if (categorynode === null) {
    const newCategory = createSection(categoryTitle, categoryTitle);
    document.getElementById("mainContent").append(newCategory);
    newCategory.querySelector("ol").append(freshList);
    addCategoryDataList(categoryTitle);
  } else {
    categorynode.querySelector("ol").append(freshList);
  }

  closeModal("newListForm");
}

async function onListItemCreation(e, list) {
  e.preventDefault();
  const listContentText = document.getElementById("newTextItem").value;
  const listContentLink = document.getElementById("newLinkItem").value;
  let newListItem;
  switch (list.type) {
    case "todo":
      newListItem = { content: listContentText, checked: false };
      break;
    case "link":
      newListItem = { content: listContentText, link: listContentLink };
      break;
    case "text":
      newListItem = { content: listContentText };
      break;
    default:
      alert("Type does not exist");
      break;
  }
  try {
    const listRef = db.collection("lists").doc(list.id);

    listRef.update({
      items: firebase.firestore.FieldValue.arrayUnion(newListItem),
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    alert(error);
  }
  const freshListItem = createListItemNode(newListItem, list.type);
  const listNode = document.getElementById(list.id);
  listNode.querySelector("ol").append(freshListItem);
  closeModal("modifListContentForm");
}

function initCategoriesDataList(listsByCategoryMap) {
  for (let category of listsByCategoryMap.keys()) {
    addCategoryDataList(category);
  }
}
function addCategoryDataList(newCategoryTitle) {
  const datalist = document.getElementById("categoriesList");
  let option = document.createElement("option");
  datalist.append(option);
  option.value = newCategoryTitle;
}

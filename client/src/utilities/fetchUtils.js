const SERVER_URL = "http://localhost:8080";

async function getType(pathname) {
  try {
    const res = await fetch(`${SERVER_URL}/api/drive${pathname}?mode=type`, {
      method: "GET",
      redirect: "follow",
    });
    console.log("Sent GET (Type) Request!");
    const data = await res.text();
    return [data, res.ok, res.status];
  } catch (error) {
    return [null, false, error.message];
  }
}

async function getContents(pathname, type) {
  try {
    const res = await fetch(`${SERVER_URL}/api/drive${pathname}`, {
      method: "GET",
      redirect: "follow",
    });
    console.log("Sent GET (Content) Request!");
    let data;
    if (type === "dir") {
      data = await res.json();
      return [data, res.ok, res.status];
    }
    data = await res.text();
    return [data, res.ok, res.status];
  } catch (error) {
    return [null, false, error.message];
  }
}

async function getInfo(pathname) {
  try {
    const res = await fetch(`${SERVER_URL}/api/drive${pathname}?mode=info`, {
      method: "GET",
      redirect: "follow",
    });
    console.log("Sent GET (Info) Request!");
    const data = await res.json();
    return [data, res.ok, res.status];
  } catch (error) {
    return [null, false, error.message];
  }
}

async function editEntity(pathname, body) {
  try {
    const raw = JSON.stringify(body);
    const res = await fetch(`${SERVER_URL}/api/drive${pathname}`, {
      method: "PUT",
      body: raw,
      redirect: "follow",
      headers: new Headers({ "Content-type": "application/json" }),
    });
    console.log("Sent PUT (Edit Entity) Request!");
    const data = await res.json();
    return [data, res.ok, res.status];
  } catch (error) {
    return [null, false, error.message];
  }
}

async function deleteEntity(pathname) {
  try {
    const res = await fetch(`${SERVER_URL}/api/drive${pathname}`, {
      method: "DELETE",
      redirect: "follow",
    });
    console.log("Sent DELETE Request!");
    const data = await res.json();
    return [data, res.ok, res.status];
  } catch (error) {
    return [null, false, error.message];
  }
}

async function copyEntity(pathname, newName) {
  try {
    const res = await fetch(`${SERVER_URL}/api/drive${pathname}`, {
      method: "POST",
      redirect: "follow",
      body: JSON.stringify({ mode: "copy", newName }),
      headers: new Headers({ "Content-type": "application/json" }),
    });
    console.log("Sent POST (Copy) Request!");
    const data = await res.json();
    return [data, res.ok, res.status];
  } catch (error) {
    return [null, false, error.message];
  }
}

async function downloadFile(pathname) {
  try {
    const res = await fetch(
      `${SERVER_URL}/api/drive${pathname}?mode=download`,
      {
        method: "GET",
        redirect: "follow",
      }
    );
    console.log("Sent GET (Download) Request!");
    const data = await res.blob();
    return [data, res.ok, res.status];
  } catch (error) {
    return [null, false, error.message];
  }
}

async function uploadFile(pathname, formData) {
  try {
    const res = await fetch(`${SERVER_URL}/api/drive${pathname}`, {
      method: "POST",
      body: formData,
    });
    console.log("Sent POST (Upload) Request!");
    const data = await res.json();
    return [data, res.ok, res.status];
  } catch (error) {
    return [null, false, error.message];
  }
}

async function createFile(pathname, body) {
  try {
    const raw = JSON.stringify({ ...body, mode: "create" });
    const res = await fetch(`${SERVER_URL}/api/drive${pathname}`, {
      method: "POST",
      body: raw,
      redirect: "follow",
      headers: new Headers({ "Content-type": "application/json" }),
    });
    console.log("Sent POST (Create) Request!");
    const data = await res.json();
    return [data, res.ok, res.status];
  } catch (error) {
    return [null, false, error.message];
  }
}

async function registerUser(body) {
  try {
    const raw = JSON.stringify(body);
    const res = await fetch(`${SERVER_URL}/api/userinfo/register`, {
      method: "POST",
      body: raw,
      redirect: "follow",
      headers: new Headers({ "Content-type": "application/json" }),
    });
    if (res.ok) return true;
    else return false;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export {
  getType,
  getContents,
  editEntity,
  getInfo,
  deleteEntity,
  copyEntity,
  downloadFile,
  uploadFile,
  createFile,
  registerUser,
};

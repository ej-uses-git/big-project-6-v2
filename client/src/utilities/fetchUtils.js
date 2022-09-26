const SERVER_URL = "http://localhost:8080";

async function getType(pathname) {
  try {
    const res = await fetch(`${SERVER_URL}/api/drive${pathname}?mode=type`, {
      method: "GET",
      redirect: "follow",
    });
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
    const data = await res.json();
    return [data, res.ok, res.status];
  } catch (error) {
    return [null, false, error.message];
  }
}

export { getType, getContents, editEntity, getInfo };

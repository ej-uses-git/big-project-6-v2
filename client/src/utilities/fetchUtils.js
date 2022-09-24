const SERVER_URL = "http://localhost:8080";

async function getType(pathname) {
  console.log("Sending request!");
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

async function getContents(pathname) {
  console.log("Sending request!");
  try {
    const res = await fetch(`${SERVER_URL}/api/drive${pathname}`, {
      method: "GET",
      redirect: "follow",
    });
    let data;
    if (res.headers.get("Content-type").includes("application/json")) {
      data = await res.json();
      return [data, res.ok, res.status];
    }
    data = await res.text();
    return [data, res.ok, res.status];
  } catch (error) {
    return [null, false, error.message];
  }
}

export { getType, getContents };

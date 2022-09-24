const SERVER_URL = "http://localhost:8080";

async function getType(pathname) {
  console.log("sending request!");
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

export { getType };

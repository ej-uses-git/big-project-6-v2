function assignToState(setter) {
  return (pathname, input, oldPath, deleteOld = false) => {
    setter((prev) => {
      if (!oldPath) return { ...prev, [pathname]: input };
      let copy = { ...prev };
      const affectedPaths = Object.keys(prev).filter((path) =>
        path.includes(oldPath)
      );
      affectedPaths.forEach((path) => {
        delete copy[path];
        if (!pathname) return;
        copy[path.replaceAll(oldPath, pathname)] = prev[path];
      });
      if (!pathname) return copy;
      if (deleteOld) delete copy[oldPath];
      return copy;
    });
  };
}

const getExtension = (type) => (type && type !== "dir" ? `.${type}` : "");

export { assignToState, getExtension };

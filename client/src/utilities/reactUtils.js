function assignToState(setter) {
  return (pathname, input, oldPath) => {
    setter((prev) => {
      if (!oldPath) return { ...prev, [pathname]: input };
      const copy = { ...prev };
      console.log("oldpath: ", oldPath);
      delete copy[oldPath];
      if (!pathname) return copy;
      copy[pathname] = input;
      return copy;
    });
  };
}

const getExtension = (type) =>
  type && type !== "dir" && type !== "file" ? `.${type}` : "";

export { assignToState, getExtension };

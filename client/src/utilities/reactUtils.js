function assignToState(setter) {
  return (pathname, input, oldPath) => {
    setter((prev) => {
      if (!oldPath) return { ...prev, [pathname]: input };
      const copy = { ...prev };
      delete copy[oldPath];
      copy[pathname] = input;
      return copy;
    });
  };
}

export { assignToState };

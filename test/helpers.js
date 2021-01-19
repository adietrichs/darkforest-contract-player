exports.getError = async fn => {
  try {
    await fn();
    return null
  }
  catch(e) {
    if (e.name == "AssertionError") {
      throw(e);
    }
    return e
  }
}

export function success(data: any, status = 200) {
  return {
    success: true,
    status,
    data,
  };
}

export function failure(error: any, status = 400) {
  return {
    success: false,
    status,
    message: error.message || "Something went wrong",
    error,
  };
}

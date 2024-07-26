export const Success = (data) => {
  return { success: true, data: data };
};
export const Error = (error) => {
  return { success: false, error: error };
};

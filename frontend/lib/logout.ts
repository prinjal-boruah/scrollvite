export function logout(router: any) {
  localStorage.removeItem("access");
  localStorage.removeItem("user");
  router.push("/login");
}

export const getAddressFromCoords = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    return data.display_name;
  } catch (error) {
    console.warn("Address lookup failed", error);
    return "Unknown Location";
  }
};
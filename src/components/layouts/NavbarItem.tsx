import { useLocation } from "react-router-dom";

// I wanted to get creative with this component, passing the svg Icon as a prop.  This way the Navbar file is less cluttered
interface NavbarItemProps {
  route: string;
  Icon: React.ElementType;
  text: string;
}

const NavbarItem: React.FC<NavbarItemProps> = ({ route, Icon, text }) => {
  const location = useLocation();
  const pathMatchRoute = (r: string): boolean => {
    if (r == location.pathname) {
      return true;
    }
    return false;
  };
  return (
    <>
      <Icon fill={pathMatchRoute(route) ? "#2c2c2c" : "#8f8f8f"} width="36px" height="36px" />
      <p className={`navbarListItemName${pathMatchRoute(route) ? "Active" : ""}`}>{text}</p>
    </>
  );
};
export default NavbarItem;

import { useNavigate } from "react-router-dom";
import OfferIcon from "../../assets/svg/localOfferIcon.svg?react";
import ExploreIcon from "../../assets/svg/exploreIcon.svg?react";
import PersonOutlineIcon from "../../assets/svg/personOutlineIcon.svg?react";
import NavbarItem from "./NavbarItem";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <footer className="navbar">
      <nav className="navbarNav">
        <ul className="navbarListItems">
          <li className="navbarListItem" onClick={() => navigate("/")}>
            <NavbarItem route="/" text="Explore" Icon={ExploreIcon} />
          </li>
          <li className="navbarListItem" onClick={() => navigate("/offers")}>
            <NavbarItem route="/offers" text="Offers" Icon={OfferIcon} />
          </li>
          <li className="navbarListItem" onClick={() => navigate("/profile")}>
            <NavbarItem route="/profile" text="Profile" Icon={PersonOutlineIcon} />
          </li>
        </ul>
      </nav>
    </footer>
  );
};
export default Navbar;

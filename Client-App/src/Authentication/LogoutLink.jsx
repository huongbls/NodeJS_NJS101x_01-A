import React from "react";
import { Link } from "react-router-dom";

function LogoutLink(props) {
  return (
    <li className="nav-item">
      <Link className="nav-link" to={`/signin`}>
        <i className="fa fa-user mr-1 text-gray"></i>Login
      </Link>
    </li>
  );
}

export default LogoutLink;

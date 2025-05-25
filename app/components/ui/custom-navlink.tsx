import { NavLink, useLocation } from '@remix-run/react';

type CustomNavLinkProps = {
  to: string;
  children: React.ReactNode;
};

const CustomNavLink = ({ to, children }: CustomNavLinkProps) => {
  const location = useLocation();

  return (
    <NavLink
      preventScrollReset
      to={{ pathname: to, search: location.search }}>
      {children}
    </NavLink>
  );
};

export default CustomNavLink;

import {
  cloneElement,
  Fragment,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Avatar,
  Brand,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Content,
  Divider,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  Gallery,
  GalleryItem,
  Masthead,
  MastheadMain,
  MastheadLogo,
  MastheadContent,
  MastheadBrand,
  MastheadToggle,
  Menu,
  MenuContent,
  MenuList,
  MenuItem,
  MenuToggle,
  type MenuToggleElement,
  Nav,
  NavItem,
  NavList,
  NotificationBadge,
  NotificationBadgeVariant,
  Page,
  PageSection,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  Popper,
  SkipToContent,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  MenuGroup,
  MenuSearchInput,
  SearchInput,
  Tooltip,
} from "@patternfly/react-core";
import BarsIcon from "@patternfly/react-icons/dist/esm/icons/bars-icon";
import EllipsisVIcon from "@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon";
import CogIcon from "@patternfly/react-icons/dist/esm/icons/cog-icon";
import HelpIcon from "@patternfly/react-icons/dist/esm/icons/help-icon";
import ThIcon from "@patternfly/react-icons/dist/esm/icons/th-icon";
import QuestionCircleIcon from "@patternfly/react-icons/dist/esm/icons/question-circle-icon";
import imgAvatar from "@patternfly/react-core/src/components/assets/avatarImg.svg";
import pfIcon from "@patternfly/react-core/src/demos/assets/pf-logo-small.svg";
import pfLogo from "@patternfly/react-core/src/demos/assets/PF-HorizontalLogo-Color.svg";
import { Link } from "@tanstack/react-router";

interface NavOnSelectProps {
  groupId: number | string;
  itemId: number | string;
  to: string;
}

// Add these type definitions near the top
interface MenuGroupProps {
  children: React.ReactElement<MenuListProps>;
  label: string;
}

interface MenuListProps {
  children: React.ReactElement<MenuItemProps>[];
}

interface MenuItemProps {
  itemId: string;
  id: string;
  isFavorited?: boolean;
  to?: string;
  onClick?: (event: React.MouseEvent) => void;
}

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FunctionComponent<HeaderProps> = ({ children }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isKebabDropdownOpen, setIsKebabDropdownOpen] = useState(false);
  const [isFullKebabDropdownOpen, setIsFullKebabDropdownOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(1);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [refFullOptions, setRefFullOptions] = useState<Element[]>();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filteredIds, setFilteredIds] = useState<string[]>(["*"]);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const onDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onDropdownSelect = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onKebabDropdownToggle = () => {
    setIsKebabDropdownOpen(!isKebabDropdownOpen);
  };

  const onKebabDropdownSelect = () => {
    setIsKebabDropdownOpen(!isKebabDropdownOpen);
  };

  const onFullKebabDropdownToggle = () => {
    setIsFullKebabDropdownOpen(!isFullKebabDropdownOpen);
  };

  const onFullKebabDropdownSelect = () => {
    setIsFullKebabDropdownOpen(!isFullKebabDropdownOpen);
  };

  const handleMenuKeys = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (
        menuRef.current?.contains(event.target as Node) ||
        toggleRef.current?.contains(event.target as Node)
      ) {
        if (event.key === "Escape") {
          setIsOpen(false);
          toggleRef.current?.focus();
        }
      }
    },
    [isOpen]
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (isOpen && !menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    },
    [isOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleMenuKeys);
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleMenuKeys);
      window.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside, handleMenuKeys]);

  const onToggleClick = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    setTimeout(() => {
      if (menuRef.current) {
        const firstElement = menuRef.current.querySelector(
          "li > button:not(:disabled), li > a:not(:disabled), input:not(:disabled)"
        );
        if (firstElement) {
          (firstElement as HTMLElement).focus();
        }
        setRefFullOptions(
          Array.from(
            menuRef.current.querySelectorAll(
              "li:not(li[role=separator])>*:first-child"
            )
          )
        );
      }
    }, 0);
    setIsOpen(!isOpen);
  };

  const toggle = (
    <MenuToggle
      aria-label="Toggle"
      ref={toggleRef}
      variant="plain"
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={{ width: "auto" }}
      icon={<ThIcon />}
    />
  );

  const menuItems = [
    <MenuGroup key="group1" label="Group 1">
      <MenuList>
        <MenuItem onClick={() => alert("App1")} itemId="0" id="0" isFavorited={favorites.includes("0")}>
          Application 1
        </MenuItem>
        <MenuItem
          itemId="1"
          id="1"
          isFavorited={favorites.includes("1")}
          to="#default-link2"
          onClick={(ev) => ev.preventDefault()}
        >
          Application 2
        </MenuItem>
      </MenuList>
    </MenuGroup>,
    <Divider key="group1-divider" />,
    <MenuGroup key="group2" label="Group 2">
      <MenuList>
        <MenuItem
          itemId="2"
          id="2"
          isFavorited={favorites.includes("2")}
          to="#default-link3"
          onClick={(ev) => ev.preventDefault()}
        >
          Application 3
        </MenuItem>
        <MenuItem
          itemId="3"
          id="3"
          isFavorited={favorites.includes("3")}
          isExternalLink
          icon={<img src={pfIcon} alt="" />}
          to="#default-link4"
          onClick={(ev) => ev.preventDefault()}
        >
          Application 4 with icon
        </MenuItem>
      </MenuList>
    </MenuGroup>,
    <Divider key="group2-divider" />,
    <MenuList key="other-items">
      <MenuItem
        key="tooltip-app"
        isFavorited={favorites.includes("4")}
        itemId="4"
        id="4"
      >
        <Tooltip content={<div>Launch Application 4</div>} position="right">
          <span>Application 4 with tooltip</span>
        </Tooltip>
      </MenuItem>
      <MenuItem key="disabled-app" itemId="5" id="5" isDisabled>
        Unavailable Application
      </MenuItem>
    </MenuList>,
  ];

  const createFavorites = (favIds: string[]) => {
    const favorites: React.ReactNode[] = [];

    menuItems.forEach((item) => {
      if (item.type === MenuList) {
        (item as React.ReactElement<MenuListProps>).props.children.forEach(
          (child: React.ReactElement<MenuItemProps>) => {
            if (favIds.includes(child.props.itemId)) {
              favorites.push(child);
            }
          }
        );
      } else if (item.type === MenuGroup) {
        (
          item as React.ReactElement<MenuGroupProps>
        ).props.children.props.children.forEach(
          (child: React.ReactElement<MenuItemProps>) => {
            if (favIds.includes(child.props.itemId)) {
              favorites.push(child);
            }
          }
        );
      } else if (
        favIds.includes(
          (item as React.ReactElement<MenuItemProps>).props.itemId
        )
      ) {
        favorites.push(item);
      }
    });

    return favorites;
  };

  const filterItems = (items: React.ReactElement[], filteredIds: string[]) => {
    if (filteredIds.length === 1 && filteredIds[0] === "*") {
      return items;
    }
    let keepDivider = false;
    const filteredCopy = items
      .map((group) => {
        if (group.type === MenuGroup) {
          const typedGroup = group as React.ReactElement<MenuGroupProps>;
          const filteredGroup = cloneElement(typedGroup, {
            children: cloneElement(typedGroup.props.children, {
              children: typedGroup.props.children.props.children.filter(
                (child: React.ReactElement<MenuItemProps>) =>
                  filteredIds.includes(child.props.itemId)
              ),
            }),
          });
          const filteredList = filteredGroup.props.children;
          if (filteredList.props.children.length > 0) {
            keepDivider = true;
            return filteredGroup;
          }
          keepDivider = false;
        } else if (group.type === MenuList) {
          const typedGroup = group as React.ReactElement<MenuListProps>;
          const filteredGroup = cloneElement(typedGroup, {
            children: typedGroup.props.children.filter(
              (child: React.ReactElement<MenuItemProps>) =>
                filteredIds.includes(child.props.itemId)
            ),
          });
          if (filteredGroup.props.children.length > 0) {
            keepDivider = true;
            return filteredGroup;
          }
          keepDivider = false;
        } else if (
          (keepDivider && group.type === Divider) ||
          filteredIds.includes(
            (group as React.ReactElement<MenuItemProps>).props.itemId!
          )
        ) {
          return group;
        }
        return null;
      })
      .filter(Boolean) as React.ReactElement[];

    if (filteredCopy.length > 0) {
      const lastGroup = filteredCopy.pop()!;
      if (lastGroup?.type !== Divider) {
        filteredCopy.push(lastGroup);
      }
    }

    return filteredCopy;
  };

  const onTextChange = (textValue: string) => {
    if (textValue === "") {
      setFilteredIds(["*"]);
      return;
    }

    const filteredIds =
      refFullOptions
        ?.filter((item) =>
          (item as HTMLElement).innerText
            .toLowerCase()
            .includes(textValue.toLowerCase())
        )
        .map((item) => item.id) || [];
    setFilteredIds(filteredIds);
  };

  const onFavorite = (
    event: React.MouseEvent,
    itemId: string,
    actionId: string
  ) => {
    event.stopPropagation();
    if (actionId === "fav") {
      const isFavorite = favorites.includes(itemId);
      setFavorites(
        isFavorite
          ? favorites.filter((fav) => fav !== itemId)
          : [...favorites, itemId]
      );
    }
  };

  const filteredFavorites = filterItems(
    createFavorites(favorites) as React.ReactElement[],
    filteredIds
  );
  const filteredItems = filterItems(
    menuItems as React.ReactElement[],
    filteredIds
  );
  if (filteredItems.length === 0) {
    filteredItems.push(<MenuItem key="no-items">No results found</MenuItem>);
  }

  const menu = (
    <Menu
      ref={menuRef}
      onActionClick={onFavorite}
      onSelect={(_ev, itemId) => console.log("selected", itemId)}
    >
      <MenuSearchInput>
        <SearchInput
          aria-label="Filter menu items"
          onChange={(_event, value) => onTextChange(value)}
        />
      </MenuSearchInput>
      <Divider />
      <MenuContent>
        {filteredFavorites.length > 0 && (
          <>
            <MenuGroup key="favorites-group" label="Favorites">
              <MenuList>{filteredFavorites}</MenuList>
            </MenuGroup>
            <Divider key="favorites-divider" />
          </>
        )}
        {filteredItems}
      </MenuContent>
    </Menu>
  );

  const dashboardBreadcrumb = (
    <Breadcrumb>
      <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
       <BreadcrumbItem isActive><Link to="/projects">Projects</Link></BreadcrumbItem>
      {/* <BreadcrumbItem to="#">Section title</BreadcrumbItem>
      <BreadcrumbItem to="#">Section title</BreadcrumbItem>
      <BreadcrumbItem to="#" isActive>
        Section landing
      </BreadcrumbItem> */}
    </Breadcrumb>
  );

  const kebabDropdownItems = (
    <>
      <DropdownItem key="settings">
        <CogIcon /> Settings
      </DropdownItem>
      <DropdownItem key="help">
        <HelpIcon /> Help
      </DropdownItem>
    </>
  );

  const userDropdownItems = [
    <Fragment key="user-group">
      <DropdownItem onClick={() => alert("hello")} key="group-2-profile">My profile</DropdownItem>
      <DropdownItem key="group-2-user">User management</DropdownItem>
      <DropdownItem key="group-2-logout">Logout</DropdownItem>
    </Fragment>,
  ];

  const headerToolbar = (
    <Toolbar id="toolbar" isStatic>
      <ToolbarContent>
        <ToolbarGroup
          variant="action-group-plain"
          align={{ default: "alignEnd" }}
          gap={{ default: "gapNone", md: "gapMd" }}
        >
          <ToolbarItem>
            <NotificationBadge
              aria-label="Notifications"
              variant={NotificationBadgeVariant.read}
              onClick={() => {}}
            />
          </ToolbarItem>
          <ToolbarGroup
            variant="action-group-plain"
            visibility={{ default: "hidden", lg: "visible" }}
          >
            <ToolbarItem
              visibility={{ default: "hidden", md: "hidden", lg: "visible" }}
            >
              <Popper
                trigger={toggle}
                triggerRef={toggleRef}
                popper={menu}
                popperRef={menuRef}
                isVisible={isOpen}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button
                aria-label="Settings"
                variant={ButtonVariant.plain}
                icon={<CogIcon />}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button
                aria-label="Help"
                variant={ButtonVariant.plain}
                icon={<QuestionCircleIcon />}
              />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarItem
            visibility={{ default: "hidden", md: "visible", lg: "hidden" }}
          >
            <Dropdown
              isOpen={isKebabDropdownOpen}
              onSelect={onKebabDropdownSelect}
              onOpenChange={setIsKebabDropdownOpen}
              popperProps={{ position: "right" }}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={onKebabDropdownToggle}
                  isExpanded={isKebabDropdownOpen}
                  variant="plain"
                  aria-label="Settings and help"
                  icon={<EllipsisVIcon />}
                />
              )}
            >
              <DropdownList>{kebabDropdownItems}</DropdownList>
            </Dropdown>
          </ToolbarItem>
          <ToolbarItem visibility={{ md: "hidden" }}>
            <Dropdown
              isOpen={isFullKebabDropdownOpen}
              onSelect={onFullKebabDropdownSelect}
              onOpenChange={setIsFullKebabDropdownOpen}
              popperProps={{ position: "right" }}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={onFullKebabDropdownToggle}
                  isExpanded={isFullKebabDropdownOpen}
                  variant="plain"
                  aria-label="Toolbar menu"
                  icon={<EllipsisVIcon />}
                />
              )}
            >
              <DropdownGroup key="group-2" aria-label="User actions">
                <DropdownList>{userDropdownItems}</DropdownList>
              </DropdownGroup>
              <Divider />
              <DropdownList>{kebabDropdownItems}</DropdownList>
            </Dropdown>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarItem visibility={{ default: "hidden", md: "visible" }}>
          <Dropdown
            isOpen={isDropdownOpen}
            onSelect={onDropdownSelect}
            onOpenChange={setIsDropdownOpen}
            popperProps={{ position: "right" }}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                onClick={onDropdownToggle}
                isExpanded={isDropdownOpen}
                icon={<Avatar src={imgAvatar} alt="" size="sm" />}
              >
                John Smith
              </MenuToggle>
            )}
          >
            <DropdownList>{userDropdownItems}</DropdownList>
          </Dropdown>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const masthead = (
    <Masthead>
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton variant="plain" aria-label="Global navigation">
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
        <MastheadBrand>
          <MastheadLogo>
             <Link to="/" className="[&.active]:font-bold">
            <Brand
              src={pfLogo}
              alt="PatternFly"
              heights={{ default: "36px" }}
              />
              </Link>{" "}
          </MastheadLogo>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>{headerToolbar}</MastheadContent>
    </Masthead>
  );

  const onNavSelect = (
    _event: React.FormEvent<HTMLInputElement>,
    selectedItem: NavOnSelectProps
  ) => {
    if (typeof selectedItem.itemId === "number") {
      setActiveItem(selectedItem.itemId);
    }
  };

  const pageNav = (
    <Nav onSelect={onNavSelect} aria-label="Nav">
      <NavList>
        <NavItem component={Link} itemId={0} isActive={activeItem === 0} to="/administration">
          Administration
        </NavItem>
        <NavItem component={Link} itemId={1} isActive={activeItem === 1} to="/projects">
          Projects
        </NavItem>
      </NavList>
    </Nav>
  );

  const sidebar = (
    <PageSidebar>
      <PageSidebarBody>{pageNav}</PageSidebarBody>
    </PageSidebar>
  );

  const mainContainerId = "main-content-page-layout-tertiary-nav";

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    document.getElementById(mainContainerId)?.focus();
  };

  const pageSkipToContent = (
    <SkipToContent onClick={handleClick} href={`#${mainContainerId}`}>
      Skip to content
    </SkipToContent>
  );

  return (
    <Page
      masthead={masthead}
      sidebar={sidebar}
      isManagedSidebar
      skipToContent={pageSkipToContent}
      breadcrumb={dashboardBreadcrumb}
      mainContainerId={mainContainerId}
      isHorizontalSubnavWidthLimited
      isBreadcrumbWidthLimited
      isBreadcrumbGrouped
    >
      {children}
    </Page>
  );
};

export default Header;

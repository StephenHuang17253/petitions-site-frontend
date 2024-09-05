import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import PendingActionsSharpIcon from '@mui/icons-material/PendingActionsSharp';
import {AccountCircle, EditNote, EditNoteTwoTone} from "@mui/icons-material";
import LoginIcon from '@mui/icons-material/Login';
import useAuthStore from "../store";
import axios from "axios";
import {useLocation, useNavigate} from "react-router-dom";

type pageTuple = [string, string];
const pages: pageTuple[] = [
    ['View Petitions', '/petitions'],
    ['Create Petition', '/petitions/create'],
    ['My Petitions', '/petitions/mine']
];



const ResponsiveAppBar = () => {
    const navigate = useNavigate();
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const isAuthenticated  = useAuthStore((state) => state.isAuthenticated);
    const userLogout = useAuthStore(state => state.userLogout);
    const authToken = useAuthStore(state => state.token);
    const userId = useAuthStore(state => state.userId);
    const [user, setUser] = React.useState<User | null>(null)
    const [userImageLink, setUserImageLink] = React.useState<string>("")

    React.useEffect(() => {
        if (isAuthenticated) {
            getUser();
            getUserImage();
        }
    }, [isAuthenticated]);

    React.useEffect(() => {

        const timer = setTimeout(() => {
            getUserImage();
        }, 100);
        return () => clearTimeout(timer);
    }, []);



    const logout = async () => {
        try {
            const response = await axios.post(`http://localhost:4941/api/v1/users/logout`, {}, {
                headers: {
                    "X-Authorization": authToken
                }
            });
            console.log('User logged out successfully');
            userLogout()
            navigate('/petitions')
        } catch (error) {
            console.error('Failed to logout user', error);
        }
    };

    const getUser = () => {
        axios.get(`http://localhost:4941/api/v1/users/${userId}/`)
            .then((response) => {
                setUser(response.data)
            })

    }

    const getUserImage = async () => {
        try {
            const response = await axios.get(`http://localhost:4941/api/v1/users/${userId}/image`,
                {
                    headers: {
                        'accept': 'image/*',
                        'X-Authorization': authToken
                    },responseType: 'arraybuffer'});
            const imageUrl = URL.createObjectURL(new Blob([response.data])); // Adjust the MIME type accordingly
            setUserImageLink(imageUrl);
        } catch (error) {
            console.error('Error fetching user image:', error);
        }
    }

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleClickProfile = () => {
        navigate('/profile')
        setAnchorElUser(null);
    };

    const handleClickLogout = async () => {
        await logout()
        navigate('/home')
        setAnchorElUser(null);
    };


    return (
        <AppBar position="static" sx={{backgroundColor: '#153a52'}}>
            <Container maxWidth="xl" sx={{

            }}>
                <Toolbar disableGutters>
                    <EditNote sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="/home"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                            '&:hover': {
                                cursor: 'pointer',
                                color: "#db9000"
                            }
                        }}
                    >
                        Petitioners
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }}}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {pages.map(([page, link]) => (
                                <MenuItem key={page} onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">{page}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <EditNote sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href=""
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Petitions
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map(([page, link]) => (
                            <Button
                                key={page}
                                component="a"
                                href={link}
                                onClick={handleCloseNavMenu}
                                sx={{ my: 2, color: 'white', display: 'block',
                                    '&:hover': {
                                        cursor: 'pointer',
                                        color: "#db9000"
                                    }, }}
                            >
                                {page}
                            </Button>
                        ))}
                    </Box>


                    {!isAuthenticated && (
                    <Button
                        component="a"
                        href={'/login'}
                        sx={{ my: 2, color: 'white', display: 'block',
                            '&:hover': {
                                cursor: 'pointer',
                                color: "#db9000"
                            }, }}
                    >
                        Login

                        <AccountCircle></AccountCircle>

                    </Button>
                    )}

                    {isAuthenticated && (
                        <Box sx={{ flexGrow: 0 }}>


                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, color: "white" }}>
                                    <Avatar alt={user?.firstName} src={userImageLink} />

                                    <Typography
                                        sx={{padding: "4px", fontFamily: 'Roboto'}}>
                                        {user?.firstName}
                                    </Typography>

                                </IconButton>
                            </Tooltip>



                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >

                                <MenuItem onClick={handleClickProfile}>
                                    <Typography textAlign="center">Profile</Typography>
                                </MenuItem>

                                <MenuItem onClick={handleClickLogout}>
                                    <Typography textAlign="center">Logout</Typography>
                                </MenuItem>

                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;
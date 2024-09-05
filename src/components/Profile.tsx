import {Link, useLocation, useNavigate} from "react-router-dom";
import Register from "./Register";
import ResponsiveAppBar from "./Navbar";
import React from "react";
import CSS from "csstype";
import {Card, CardContent, CardHeader, Grid, IconButton, InputAdornment, TextField, Typography} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import useAuthStore from "../store";
import axios from "axios";
import Button from "@mui/material/Button";

const Profile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAuthStore();
    const [userInfo, setUserInfo] = React.useState<UserInfo>({
        email: "",
        firstName: "",
        lastName: "",
        })
    const [userImage, setUserImage] = React.useState<string>('');


    React.useEffect(() => {

        if (!user.isAuthenticated) {
            navigate('/login');
        }

        getUser()
        getUserImage()

    }, [])

    React.useEffect(() => {

        const timer = setTimeout(() => {
            getUserImage();
        }, 100);


        return () => clearTimeout(timer);
    }, []);



    const getUser = async () => {
        try {
            const response = await axios.get(`http://localhost:4941/api/v1/users/${user.userId}/`,
            {
                headers: {
                    'X-Authorization': user.token
                }});
            setUserInfo(response.data);
            console.log("Successfully got user info")
        } catch (error) {
            console.error('Error fetching user:', error);

        }
    }

    const getUserImage = async () => {
        try {
            const response = await axios.get(`http://localhost:4941/api/v1/users/${user.userId}/image`,
                {
                    headers: {
                        'accept': 'image/*',
                        'X-Authorization': user.token
                    },responseType: 'arraybuffer'});
            const imageUrl = URL.createObjectURL(new Blob([response.data])); // Adjust the MIME type accordingly
            setUserImage(imageUrl);
        } catch (error) {
            console.error('Error fetching user image:', error);
        }
    }


    const card: CSS.Properties = {
        padding: "110px",
        margin: "20px",
        display: "block",
        alignItems: "center",
        justifySelf: "center",
        width: "98%",
        height: "720px"

    }

    return (

        <>
            <ResponsiveAppBar/>

            <div style={card}>

                <Card elevation={5} sx={{
                    flexDirection: "column",
                    margin: "auto",
                    maxWidth: "32%",
                    alignItems: "center",
                    padding: "24px",
                }}>


                    <Grid item xs={12}>
                        <CardHeader
                            sx={{
                                display: "block",
                                width: "55%",
                                margin: "auto",
                                justifyContent: 'center',
                                justifyItems: "center",
                                alignItems: 'center',
                                padding: '0',
                            }}
                            avatar={

                                <Avatar
                                    sx={{

                                        margin: "auto",
                                        height: "265px",
                                        width: "265px",
                                        objectFit: "contain"
                                    }}
                                    alt={userInfo.firstName}
                                    src={userImage}
                                />
                            }
                        />
                    </Grid>


                    <Typography component="h1" variant="h4" sx={{padding: "24px"}}>
                        {userInfo.firstName} {userInfo.lastName}
                    </Typography>

                        <Grid container spacing={2}>

                            <Grid item xs={12}>
                                <Typography>
                                    {userInfo.email}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Button sx={{padding:"0px"}}>
                                    <Link to={"/profile/edit"}>
                                        Edit Profile
                                    </Link>
                                </Button>


                            </Grid>

                        </Grid>

                </Card>
            </div>

        </>

    )
}



export default Profile;
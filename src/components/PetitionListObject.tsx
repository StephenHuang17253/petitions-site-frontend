import React from "react";
import axios from "axios";
import {Delete, Edit} from "@mui/icons-material";
import {
    Avatar, Button, Card, CardActionArea, CardActions, CardContent, CardHeader, CardMedia, Chip, Dialog,
    DialogActions, DialogContent, DialogContentText,
    DialogTitle, IconButton, TextField, Typography
} from "@mui/material";
import {Link, useNavigate} from 'react-router-dom';
import CSS from 'csstype';
import useAuthStore from "../store";

interface IPetitionProps {
    petition: Petition
}

const PetitionListObject = (props: IPetitionProps) => {
    const navigate = useNavigate();
    const [petition] = React.useState<Petition>(props.petition)
    const [title, setTitle] = React.useState("")
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
    const [openEditDialog, setOpenEditDialog] = React.useState(false)
    const [creationDate, setCreationDate] = React.useState<string>("");
    const [category, setCategory] = React.useState<category>({categoryId: 0, name:""});
    const ownerImage = `http://localhost:4941/api/v1/users/${petition.ownerId}/image`;
    const petitionImage = `http://localhost:4941/api/v1/petitions/${petition.petitionId}/image`;
    const user = useAuthStore();
    const [userId, setUserId] = React.useState<number>(-1);

    React.useEffect(() => {
        // Parse the creationDate string into a Date object
        const parsedDate = new Date(petition.creationDate);
        // Format the date as YYYY-MM-DD
        const formattedDate = parsedDate.toLocaleString('en-NZ', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: 'numeric',
            minute: 'numeric'
        });
        setCreationDate(formattedDate);

        const getCategory = async () => {
            try {
                const response = await axios.get('http://localhost:4941/api/v1/petitions/categories/');
                const categoriesData = response.data;
                const category = categoriesData.find((category: { categoryId: number; }) => category.categoryId === petition.categoryId);
                if (category) {
                    setCategory(category);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Handle error state or show a message to the user
            }
        }
        getCategory()


    }, []);

    React.useEffect(() => {
        if (userId === -1 && user.userId !== null) {
            setUserId(parseInt(user.userId))
        }
    }, [user])

    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog(false);
    };
    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
    };
    const handleDeleteDialogOpen = (petition: Petition) => {
        setOpenDeleteDialog(true);
    };
    const handleEditDialogOpen = (petition: Petition) => {
        setOpenEditDialog(true);
    };

    const handleClickPetitionHero = () => {
        navigate(`/petitions/${petition.petitionId}`);
    };

    const handleEdit = () => {
        navigate(`/petitions/${petition.petitionId}/edit`)
    }

    const getCategoryColor = (categoryName: string): string => {
        // Define a mapping of category names to chip colors
        const categoryColorMap: Record<string, string> = {
            "Animal Rights": '#4CAF50', // Green
            "Arts and Culture": '#9C27B0', // Purple
            "Community Development": '#2196F3', // Blue
            "Economic Empowerment": '#FF9800', // Orange
            "Education": '#2196F3', // Blue
            "Environmental Causes": '#4CAF50', // Green
            "Health and Wellness": '#e52a2a', // Red
            "Human Rights": '#FF5252', // Red
            "Science and Research": '#2196F3FF',  // Blue
            "Sports and Recreation": '#FF521B', // Red
            "Technology and Innovation": '#0E568EFF', // Dark Blue
            "Wildlife": '#006600FF'  // Dark green




        };
        return categoryColorMap[categoryName] || '#999999FF'; // Should never be gray tbh
    };




    const petitionCardStyles: CSS.Properties = {
        display: "inline-block",
        height: "400px",
        width: "400px",
        margin: "10px",
        padding: "0px",
    }




    return (
        <Card sx={petitionCardStyles}>
            <CardActionArea href={`/petitions/${petition.petitionId}`}>
                <CardMedia
                component="img"
                height="200"
                width="200"
                sx={{objectFit: "cover"}}
                image={petitionImage}
                alt="Petition hero"
                onClick={handleClickPetitionHero}
                />

                <Typography variant="h6" textOverflow={"ellipsis"}
                            sx={{ color: 'dark', paddingTop: "16px"}}>
                    {petition.title}
                </Typography>
            </CardActionArea>


            <CardContent sx={{paddingTop: "0px"}}>

                <CardHeader
                    sx={{
                        width: 'fit-content',
                        margin: 'auto',
                    }}
                    avatar={

                        <Avatar
                            sx={{
                                height: 48,
                                width: 48
                            }}
                            alt={petition.ownerFirstName}
                            src={ownerImage}
                        />
                    }
                    title={petition.ownerFirstName + " " + petition.ownerLastName}
                    subheader={`Created ${creationDate}`}
                />

                <div style={{alignContent: "left", justifyContent: "left"}}>

                    <Chip label={category ? category.name : ''} variant="filled" color="info"
                          sx={{
                              backgroundColor: getCategoryColor(category ? category.name : ''),
                              padding: '4px 8px',
                              marginRight: '4px',
                          }}/>

                    <Chip
                        label={`Support for $${petition.supportingCost}`}
                        color="success"
                        sx={{
                            backgroundColor: '#ff6b1c',
                            padding: '4px 8px',
                            marginRight: '4px',
                        }}/>
                </div>

                {userId === petition.ownerId && (
                    <CardActions sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <Button onClick={handleEdit} size="medium" color="info" >
                            Edit Petition
                        </Button>
                    </CardActions>
                )}



            </CardContent>

        </Card>

    )
}

export default PetitionListObject
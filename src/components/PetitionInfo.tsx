import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ResponsiveAppBar from "./Navbar";
import CSS from "csstype";
import {
    Avatar,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    CardMedia,
    Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid,
    Paper,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import Box from "@mui/material/Box";
import PetitionListObject from "./PetitionListObject";
import useAuthStore from "../store";
import {enqueueSnackbar} from "notistack";



const PetitionInfo = () => {
    const { id } = useParams(); // Get the petition ID from URL
    const [petition, setPetition] = useState<PetitionFull>({
        categoryId: 0,
        creationDate: "",
        description: "",
        moneyRaised: 0,
        numberOfSupporters: 0,
        ownerFirstName: "",
        ownerId: 0,
        ownerLastName: "",
        petitionId: 0,
        supportTiers: [],
        supportingCost: 0,
        title: "Not Found"});
    const [creationDate, setCreationDate] = React.useState<string>("");
    const [category, setCategory] = React.useState<category>({categoryId: 0, name:""});
    const [supporters, setSupporters] = React.useState<supporter[] | []>([]);
    const ownerImage = `http://localhost:4941/api/v1/users/${petition?.ownerId}/image`;
    const [petitionImage, setPetitionImage] = React.useState<string>(`http://localhost:4941/api/v1/petitions/${id}/image`);
    const theme = useTheme();
    const [sameOwnerPetitions, setSameOwnerPetitions] = React.useState<Petition[]>([]);
    const [sameCategoryPetitions, setSameCategoryPetitions] = React.useState<Petition[]>([]);
    const [similarPetitions, setSimilarPetitions] = React.useState<Petition[]>([]);
    const [showSupporters, setShowSupporters] = React.useState(false);
    const toggleShowSupportersText = showSupporters? "Hide Supporters" : "Show Supporters";
    const [showSimilarPetitions, setShowSimilarPetitions] = React.useState(false);
    const toggleShowSimilarPetitionsText = showSimilarPetitions? "Hide Similar Petitions" : "Show Similar Petitions";
    const user = useAuthStore();
    const [openSupportDialog, setOpenSupportDialog] = React.useState(false);
    const [supportTier, setSupportTier] = React.useState<supportTier>();
    const [supportMessage, setSupportMessage] = React.useState<string>("")

    const getPetitionDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:4941/api/v1/petitions/${id}`);
            setPetition(response.data);
        } catch (error) {
            console.error('Failed to load petition details:', error);
        }
    };

    const getSupporters = async () => {
        try {
            const response = await axios.get(`http://localhost:4941/api/v1/petitions/${id}/supporters`);
            setSupporters(response.data);
        } catch (error) {
            console.error('Failed to get petition supporters:', error);
        }
    };

    useEffect(() => {

        getPetitionDetails();
        setPetitionImage(`http://localhost:4941/api/v1/petitions/${id}/image`)
        getSupporters();
    }, [showSupporters, openSupportDialog]);



    useEffect(() => {

        if (petition.title !== "Not Found" && category.categoryId !== 0) {
            const getSameOwnerPetitions = () => {
                axios.get(`http://localhost:4941/api/v1/petitions?ownerId=${petition.ownerId}`)
                    .then((response) => {
                        const petitionsWithSameOwner = response.data.petitions.filter((p: { petitionId: any; }) => p.petitionId!==petition.petitionId)
                        setSameOwnerPetitions(petitionsWithSameOwner)
                    }, (error) => {
                        console.log(error)
                    })
            }
            getSameOwnerPetitions()


            const getSameCategoryPetitions = () => {
                console.log(category.categoryId)
                axios.get(`http://localhost:4941/api/v1/petitions?categoryIds=${category.categoryId}`)
                    .then((response) => {
                        const petitionsWithSameCategory = response.data.petitions.filter((p: { petitionId: any; }) => p.petitionId!==petition.petitionId)
                        setSameCategoryPetitions(petitionsWithSameCategory)
                    }, (error) => {
                        console.log(error)
                    })
            }
            getSameCategoryPetitions()

            const combinedPetitions = [...sameOwnerPetitions,...sameCategoryPetitions]
            const uniquePetitions =
                Array.from(new Set(combinedPetitions
                .map(petition => petition.petitionId)))
                .map(id => combinedPetitions.find(petition => petition.petitionId === id));

            // @ts-ignore
            setSimilarPetitions(uniquePetitions);

        }


    }, [petition, category, showSimilarPetitions])





    useEffect(() => {

        if (petition.title !== "Not Found") {
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
            getCategory();
        }

        const parsedDate = new Date(petition?.creationDate || "");
        // Format the date as YYYY-MM-DD
        const formattedDate = parsedDate.toLocaleString('en-NZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

        setCreationDate(formattedDate);
    }, [petition]);

    if (!petition) return <div>Loading...</div>;


    const toggleShowSupporters = () => {
        setShowSupporters(!showSupporters);

    };

    const toggleShowSimilarPetitions = () => {
        setShowSimilarPetitions(!showSimilarPetitions);

    };

    const handleSupportTierClick = async (supportTierId: number | undefined, supportMessage: string) => {
        // Check if the user is logged in
        console.log(user.isAuthenticated)
        if (!user.isAuthenticated) {
            enqueueSnackbar("Please log in to support a petition.", {variant: "error"});
            return;
        }

        // Check if the user is trying to support their own petition
        if (parseInt(user.userId as string) === petition.ownerId) {
            enqueueSnackbar("Cannot support your own petition.", {variant: "error"});
            return;
        }

        let requestBody: {}

        if (supportMessage !== "") {
            requestBody = {
                supportTierId,
                message: supportMessage
            }
        } else {
            requestBody = {
                supportTierId
            }
        }

        try {
            const response = await axios.post(`http://localhost:4941/api/v1/petitions/${petition.petitionId}/supporters/`,
                requestBody,
            {
                headers: {
                    'X-Authorization': user.token
                }
            });
            await getSupporters()
            enqueueSnackbar("Supported tier")
            setOpenSupportDialog(false)
            //
            // setTimeout(() => {
            //     window.location.reload();
            // }, 500)

        } catch (error: any) {
            console.error('Failed to support tier:', error);

            if (error.response) {
                if (error.response.statusText.includes("Duplicate supporter")) {
                    enqueueSnackbar("You already support this tier", {variant: "error"})
                } else {
                    enqueueSnackbar(error.response.statusText, {variant: "error"})
                }
            }
        }

    };

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

    // const same_owner_petition_rows = () => {
    //     if (!Array.isArray(sameOwnerPetitions)) return null; // Handle null/undefined
    //     return sameOwnerPetitions.map((petition: Petition) => (
    //         <PetitionListObject key={petition.petitionId + petition.title} petition={petition} />
    //     ));
    // };
    //
    // const same_category_petition_rows = () => {
    //     if (!Array.isArray(sameOwnerPetitions)) return null; // Handle null/undefined
    //     return sameCategoryPetitions.map((petition: Petition) => (
    //         <PetitionListObject key={petition.petitionId + petition.title} petition={petition} />
    //     ));
    // };

    const similar_petition_rows = () => {
        if (!Array.isArray(similarPetitions) || similarPetitions.length === 0) {
            return <Typography gutterBottom>No similar petitions found</Typography>;
        }

        return similarPetitions.map((petition: Petition) => (
            <PetitionListObject key={petition.petitionId + petition.title} petition={petition} />
        ));
    };

    const petitionDetailsCardStyles: CSS.Properties = {
        display: "inline-block",
        height: "100%",
        width: "1440px",
        margin: "10px",
        padding: "0px",
    }

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
        display: "block",
        alignItems: "center",
        width: "98%"
    }


    // @ts-ignore
    return (
        <>
        <ResponsiveAppBar/>
        <Paper elevation={5} style={card} >

            <Card sx={petitionDetailsCardStyles}>

                <Typography variant="h2" textOverflow={"ellipsis"}
                            sx={{color: 'dark', paddingTop: "16px"}}>
                    {petition.title}
                </Typography>
                <div style={{paddingTop: '8px'}}>
                    <Chip label={`Category: ${category ? category.name : ''}`} variant="filled" color="info"
                          sx={{
                              backgroundColor: getCategoryColor(category ? category.name : ''),
                              padding: '4px 8px',
                              marginRight: '4px',
                          }}/>


                    <Chip
                        label={`${petition.numberOfSupporters} ${petition.numberOfSupporters === 1 ? 'supporter' : 'supporters'} `}
                        color="success"
                        sx={{
                            backgroundColor: '#1c74ab',
                            padding: '4px 8px',
                            marginRight: '4px',
                        }}/>

                    <Chip
                        label={`${petition.moneyRaised > 0? `$${petition.moneyRaised} raised` : '$0 raised'}`}
                        color="success"
                        sx={{
                            backgroundColor: '#137715',
                            padding: '4px 8px',
                            marginRight: '4px',
                        }}/>
                </div>
                <CardHeader
                    sx={{
                        width: 'fit-content',
                        margin: 'auto',
                    }}
                    avatar={

                        <Avatar
                            sx={{
                                height: 60,
                                width: 60
                            }}
                            alt={petition.ownerFirstName}
                            src={ownerImage}
                        />
                    }
                    title={petition.ownerFirstName + " " + petition.ownerLastName}
                    subheader={`Created ${creationDate}`}
                />

                <CardMedia
                    component="img"
                    height="540"
                    width="540"
                    sx={{objectFit: "cover"}}
                    image={petitionImage}
                    alt="Petition hero"
                />


                <CardContent sx={{paddingTop: "16px"}}>

                    <Typography variant="h5" sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        alignItems: 'center', maxWidth: '55%', mx: 'auto', paddingBottom: "36px"}}>
                        {petition.description}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: '50%', mx: 'auto' }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'normal', overflowWrap: 'break-word', textAlign: 'center' }}>
                            {` This is a ${category.name} petition created by ${petition.ownerFirstName} ${petition.ownerLastName} 
                            on ${creationDate}. It has been supported by ${petition.numberOfSupporters}, and has 
                            raised $${petition.moneyRaised > 0? `${petition.moneyRaised} raised` : '0 '} dollars in total.`}
                        </Typography>
                    </Box>

                </CardContent>

                <Card elevation={4} sx={{padding: "8px"}}>
                    <Box>
                        <Typography variant="h5">Support Tiers:</Typography>
                        {/*<Grid container spacing={2}>*/}
                            {petition.supportTiers.map((tier) => (
                                // <Grid item xs={12} sm={4} key={tier.supportTierId}>
                                    <CardContent>
                                        <Typography variant="h6">{tier.title}</Typography>
                                        <Typography variant="body2">{tier.description}</Typography>
                                        <Chip
                                            sx={{marginTop: "6px"}}
                                            variant="filled"
                                            color="secondary"
                                            label={`Click to support for $${tier.cost}`}
                                            onClick={() => {
                                                setSupportTier(tier)
                                                setOpenSupportDialog(true)}}
                                        />

                                    </CardContent>
                                // </Grid>
                            ))}
                        {/*</Grid>*/}
                    </Box>
                </Card>


            </Card>


            <Card elevation={4} style={petitionDetailsCardStyles}>

                <Box>
                    <Chip
                        // clickable
                        sx={{padding: "6px", margin: "16px"}}
                        label={`${toggleShowSupportersText}`}
                        onClick={toggleShowSupporters} />
                    {/*<Typography variant="h5" sx={{padding: "16px"}}>Supporters:</Typography>*/}
                    {/*<Typography variant="h5" sx={{paddingBottom: "16px"}}>Supporters of each tier:</Typography>*/}
                    {petition.numberOfSupporters < 1 && showSupporters &&
                        <Typography gutterBottom sx={{padding: "8px"}} color="error">No supporters yet for this petition.</Typography>}
                    <Grid container spacing={2} sx={{padding: "6px"}}>


                        {petition.numberOfSupporters > 0 && showSupporters && petition.supportTiers.map((tier) => (
                            <Grid item xs={12} sm={4} key={tier.supportTierId}>
                                <Typography variant="h6">{tier.title}</Typography>
                                {supporters.filter(supporter => supporter.supportTierId === tier.supportTierId)
                                    .map((supporter) => (
                                        <CardContent
                                            sx={{paddingTop: "4px", maxWidth:"1000px", margin: "auto" }}
                                            key={`${supporter.supporterFirstName}-${supporter.supporterLastName}`}>
                                            <CardHeader
                                                sx={{
                                                    width: 'fit-content',
                                                    margin: 'auto',
                                                    paddingTop: "4px",
                                                    paddingBottom: "6px",
                                                    wordWrap: "break-word"
                                                }}
                                                avatar={
                                                    <Avatar
                                                        alt={supporter.supporterFirstName}
                                                        src={`http://localhost:4941/api/v1/users/${supporter.supporterId}/image`}
                                                        sx={{height: 60, width: 60}}/>
                                                }
                                                title={`${supporter.supporterFirstName} ${supporter.supporterLastName} supported this tier.`}
                                                subheader={
                                                    `${new Date(supporter.timestamp).toLocaleDateString('en-NZ', {
                                                        year: 'numeric',
                                                        month:'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}`}
                                            />
                                            {supporter.message? (
                                                <Chip
                                                    variant="filled"
                                                    color="success"
                                                    sx={{paddingBottom: 0, marginLeft: "48px"}}
                                                    label={supporter.message? `"${supporter.message}"` : 'No message'}
                                                />
                                            ) : ""}
                                        </CardContent>
                                    ))}
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Card>

            {/*Similar Petitions*/}
            <Card elevation={4} style={petitionDetailsCardStyles}>
                {/*<Typography variant="h4">Similar Petitions</Typography>*/}
                <Chip
                    // clickable
                    sx={{padding: "6px", margin: "16px"}}
                    label={`${toggleShowSimilarPetitionsText}`}
                    onClick={toggleShowSimilarPetitions} />
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {showSimilarPetitions && (
                            <>
                                {similar_petition_rows()}
                            </>
                        )}
                    </Grid>
                </Grid>


            </Card>

            <Dialog open={openSupportDialog} onClose={() => (setOpenSupportDialog(false))}>
                <DialogTitle>{supportTier?.title} for ${supportTier?.cost}?</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Leave a message if you wish"
                        type="text"
                        fullWidth
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => (setOpenSupportDialog(false))} sx={{color: "error"}}>Cancel</Button>
                    <Button onClick={() => (handleSupportTierClick(supportTier?.supportTierId, supportMessage))}>Confirm Support</Button>
                </DialogActions>
            </Dialog>

        </Paper>




        </>
    );
};

export default PetitionInfo;

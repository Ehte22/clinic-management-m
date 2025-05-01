import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, IconButton, TextField, Typography, Chip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { IMedicine } from '../../models/medicine.interface';
import { UseFormSetValue } from 'react-hook-form';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface IMedicineModalProps {
    open: boolean;
    setOpen: (val: boolean) => void;
    allMedicines: IMedicine[];
    setValue: UseFormSetValue<{ [x: string]: any }>;
}

const MedicineModal: React.FC<IMedicineModalProps> = ({
    open,
    setOpen,
    allMedicines,
    setValue
}) => {
    const [category, setCategory] = useState<string>('');
    const [medicines, setMedicines] = useState<IMedicine[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedMedicines, setSelectedMedicines] = useState<Record<string, string[]>>({});

    const handleClose = () => {
        setOpen(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryClick = (selectedCategory: string) => {
        setCategory(selectedCategory === category ? '' : selectedCategory);
    };

    const handleCheckboxChange = (medicine: IMedicine) => {
        const medicineCategory = medicine.category;
        const medicineName = medicine.medicineName;

        setSelectedMedicines(prev => {
            const currentCategoryMedicines = prev[medicineCategory] || [];
            const isSelected = currentCategoryMedicines.includes(medicineName);

            return {
                ...prev,
                [medicineCategory]: isSelected
                    ? currentCategoryMedicines.filter(name => name !== medicineName)
                    : [...currentCategoryMedicines, medicineName],
            };
        });
    };

    const handleRemoveMedicine = (category: string, medicineName: string) => {
        setSelectedMedicines(prev => ({
            ...prev,
            [category]: prev[category]?.filter(name => name !== medicineName) || []
        }));
    };

    const handleSubmit = () => {
        const allSelectedMedicines = Object.values(selectedMedicines).flat();
        const formattedMedicines = allSelectedMedicines.map(medicineName => {
            const medicineData = allMedicines.find(m => m.medicineName === medicineName);
            return {
                medicine: medicineName,
                category: medicineData?.category,
                // Add other fields you need from medicineData
            };
        });

        setValue("medical", formattedMedicines);
        setOpen(false);
    };

    useEffect(() => {
        let filtered = allMedicines;

        if (category) {
            filtered = filtered.filter(item => item.category === category);
        }

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setMedicines(filtered);
    }, [category, searchTerm, allMedicines]);

    const categories = [...new Set(allMedicines.map(item => item.category))];

    // Check if a medicine is selected
    const isMedicineSelected = (medicine: IMedicine) => {
        return selectedMedicines[medicine.category]?.includes(medicine.medicineName) || false;
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Select Medicines</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Search medicines"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <IconButton type="button" aria-label="search" size="small">
                                    <SearchIcon />
                                </IconButton>
                            ),
                            sx: { pr: 0.5 },
                        },
                    }}
                    sx={{
                        mr: { sm: 1 },
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                border: '1px solid black',
                            },
                            '& .MuiSvgIcon-root': {
                                color: 'gray',
                            },
                            '& .MuiInputBase-root': {
                                color: 'black',
                            },
                            '& input:-webkit-autofill': {
                                WebkitBoxShadow: '0 0 0 100px black inset',
                                WebkitTextFillColor: 'black',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'gray',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: 'black',
                        },
                    }}
                />

                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Categories</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {categories.map(cat => (
                        <Chip
                            key={cat}
                            label={cat}
                            onClick={() => handleCategoryClick(cat)}
                            color={category === cat ? 'primary' : 'default'}
                            variant={category === cat ? 'filled' : 'outlined'}
                        />
                    ))}
                </Box>

                {medicines.length > 0 && (
                    <>
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                            {category ? `Medicines in ${category}` : 'All Medicines'}
                        </Typography>
                        <FormControl component="fieldset" fullWidth>
                            <FormGroup>
                                {medicines.map(medicine => (
                                    <FormControlLabel
                                        key={medicine._id}
                                        control={
                                            <Checkbox
                                                checked={isMedicineSelected(medicine)}
                                                onChange={() => handleCheckboxChange(medicine)}
                                                color="secondary"
                                            />
                                        }
                                        label={medicine.medicineName}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>
                    </>
                )}

                {Object.keys(selectedMedicines).length > 0 && (
                    <>
                        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                            Selected Medicines
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {Object.entries(selectedMedicines).map(([category, meds]) => (
                                meds.length > 0 && (
                                    <Box key={category} sx={{ mb: 1 }}>
                                        <Typography variant="body2" fontWeight="bold">{category}</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 1 }}>
                                            {meds.map(medicine => (
                                                <Chip
                                                    key={`${category}-${medicine}`}
                                                    label={medicine}
                                                    onDelete={() => handleRemoveMedicine(category, medicine)}
                                                    deleteIcon={<CloseIcon />}
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )
                            ))}
                        </Box>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Box sx={{ textAlign: "end", px: 3, mb: 1 }}>
                    <Button
                        type='button'
                        onClick={handleClose}
                        variant='contained'
                        sx={{ backgroundColor: "#F3F3F3", py: 0.65 }}>
                        Cancel
                    </Button>
                    <Button
                        disabled={Object.values(selectedMedicines).flat().length === 0}
                        onClick={handleSubmit}
                        variant='contained'
                        sx={{ ml: 2, background: "#0777de", color: "white", py: 0.65 }}>
                        Add Medicine
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default MedicineModal;
import React, { useState } from 'react';
import {
    Dialog,
    Box,
    Typography,
    Button,
    OutlinedInput,
    CircularProgress
} from '@mui/material';

const MOCK_EMPLOYEES = [
    {
        name: 'Dr.Shreya Krishnan',
        id: 'PMCH-1082',
        department: 'Cardiology Department',
        designation: 'Cardiovascular Specialist'
    },
    {
        name: 'Dr.Amit Sharma',
        id: 'PMCH-2041',
        department: 'Cardiology Department',
        designation: 'Cardiovascular Specialist'
    },
    {
        name: 'Dr.Priya Nair',
        id: 'PMCH-3012',
        department: 'Neurology Department',
        designation: 'Neurosurgeon'
    }
];

const AddDeductionModal = ({ open, onClose, onConfirm, loading }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentEmployee, setCurrentEmployee] = useState(MOCK_EMPLOYEES[0]);
    const [chargeAmount, setChargeAmount] = useState('₹43537.00');
    const [notes, setNotes] = useState('');

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        const q = searchQuery.trim().toLowerCase();
        const found = MOCK_EMPLOYEES.find(
            (emp) => emp.name.toLowerCase().includes(q) || emp.id.toLowerCase().includes(q)
        );
        if (found) {
            setCurrentEmployee(found);
        }
    };

    const handleAmountChange = (e) => {
        let val = e.target.value;
        if (!val.startsWith('₹') && val.trim() !== '') {
            val = '₹' + val;
        }
        setChargeAmount(val);
    };

    const handleSubmit = () => {
        // Strip ₹ for numeric storage if needed, or pass as formatted
        const cleanAmount = chargeAmount.replace(/[^0-9.]/g, '');
        onConfirm({
            employeeId: currentEmployee.id,
            employeeName: currentEmployee.name,
            department: currentEmployee.department.replace(' Department', ''),
            designation: currentEmployee.designation,
            chargedAmount: cleanAmount ? `₹ ${Number(cleanAmount).toLocaleString('en-IN')}` : chargeAmount,
            notes: notes.trim() || '-'
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: '520px',
                    maxWidth: '95vw',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                    p: '32px',
                    boxSizing: 'border-box',
                    boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
                    fontFamily: 'Inter, sans-serif',
                    m: 2
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
                {/* 1. Search Input Group */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        height: '40px'
                    }}
                >
                    <OutlinedInput
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                        placeholder="Search Employee"
                        sx={{
                            flex: 1,
                            height: '40px',
                            borderRadius: '6px !important',
                            bgcolor: '#FFFFFF',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            lineHeight: '20px',
                            color: '#0F172A',
                            '& .MuiOutlinedInput-input': {
                                p: '10px 12px',
                                '&::placeholder': {
                                    color: '#64748B',
                                    opacity: 1
                                }
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                                borderRadius: '6px !important'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#94A3B8'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#644EE5',
                                borderWidth: '1.5px'
                            }
                        }}
                    />

                    <Button
                        variant="contained"
                        onClick={handleSearch}
                        sx={{
                            width: '79px',
                            height: '36px',
                            minWidth: '79px',
                            bgcolor: '#644EE5',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            p: '8px 16px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '20px',
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#523BCB',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        Search
                    </Button>
                </Box>

                {/* 2. Employee Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                    <Typography
                        sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontStyle: 'normal',
                            fontWeight: 700,
                            fontSize: '24px',
                            lineHeight: '29px',
                            color: '#0F172A'
                        }}
                    >
                        {currentEmployee.name}
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '17px',
                            color: '#64748B'
                        }}
                    >
                        {currentEmployee.department} · {currentEmployee.designation}
                    </Typography>
                </Box>

                {/* 3. Charge Amount Field */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', width: '100%' }}>
                    <Typography
                        sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '13px',
                            lineHeight: '16px',
                            color: '#0F172A'
                        }}
                    >
                        Charge Amount*
                    </Typography>
                    <OutlinedInput
                        value={chargeAmount}
                        onChange={handleAmountChange}
                        sx={{
                            width: '100%',
                            height: '41px',
                            borderRadius: '6px !important',
                            bgcolor: '#FFFFFF',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '17px',
                            color: '#0F172A',
                            '& .MuiOutlinedInput-input': {
                                p: '12px'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                                borderRadius: '6px !important'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#94A3B8'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#644EE5',
                                borderWidth: '1.5px'
                            }
                        }}
                    />
                </Box>

                {/* 4. Notes Field */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                    <Typography
                        sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '13px',
                            lineHeight: '16px',
                            color: '#0F172A'
                        }}
                    >
                        Notes
                    </Typography>
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}
                    >
                        <OutlinedInput
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            multiline
                            rows={3}
                            placeholder="provide description about charge"
                            sx={{
                                width: '100%',
                                minHeight: '96px',
                                borderRadius: '8px !important',
                                bgcolor: '#FFFFFF',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 400,
                                fontSize: '13px',
                                lineHeight: '150%',
                                color: '#0F172A',
                                p: '12px',
                                boxSizing: 'border-box',
                                '& .MuiOutlinedInput-input': {
                                    p: 0,
                                    height: '64px !important',
                                    '&::placeholder': {
                                        color: '#94A3B8',
                                        opacity: 1
                                    }
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#E2E8F0',
                                    borderRadius: '8px !important'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#94A3B8'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#644EE5',
                                    borderWidth: '1.5px'
                                }
                            }}
                        />
                        {/* Resize indicator icon */}
                        <Box
                            sx={{
                                position: 'absolute',
                                right: '10px',
                                bottom: '10px',
                                pointerEvents: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                <path d="M7 1L1 7M7 4L4 7" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </Box>
                    </Box>
                </Box>

                {/* 5. Action Footer */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        height: '36px'
                    }}
                >
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            width: '71px',
                            minWidth: '64px',
                            height: '36px',
                            bgcolor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            p: '6px 8px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '24px',
                            color: '#475569',
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                                borderColor: '#CBD5E1',
                                bgcolor: '#F8FAFC'
                            }
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                        sx={{
                            width: '78px',
                            minWidth: '64px',
                            height: '36px',
                            bgcolor: '#644EE5',
                            borderRadius: '6px',
                            p: '6px 8px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '24px',
                            color: '#FFFFFF',
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#523BCB',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : 'Confirm'}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default AddDeductionModal;

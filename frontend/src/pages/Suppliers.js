import React, { useState } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Grid,
  InputAdornment,
  IconButton,
  TableSortLabel,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Menu,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  Container,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const GET_SUPPLIERS = gql`
  query GetSuppliers {
    suppliers {
      id
      name
      contactInfo {
        email
        phone
        address {
          street
          city
          state
          zipCode
          country
        }
      }
      businessInfo {
        businessName
        taxCategory
        taxStatus
        cuit
      }
      paymentTerms
      status
      notes
      createdAt
      updatedAt
    }
  }
`;

const CREATE_SUPPLIER_MUTATION = gql`
  mutation CreateSupplier(
    $name: String!
    $contactInfo: ContactInfoInput!
    $businessInfo: BusinessInfoInput
    $paymentTerms: Int
    $notes: String
  ) {
    createSupplier(
      name: $name
      contactInfo: $contactInfo
      businessInfo: $businessInfo
      paymentTerms: $paymentTerms
      notes: $notes
    ) {
      id
      name
      contactInfo {
        email
        phone
      }
    }
  }
`;

const UPDATE_SUPPLIER_MUTATION = gql`
  mutation UpdateSupplier(
    $id: ID!
    $name: String
    $contactInfo: ContactInfoInput
    $businessInfo: BusinessInfoInput
    $paymentTerms: Int
    $status: String
    $notes: String
  ) {
    updateSupplier(
      id: $id
      name: $name
      contactInfo: $contactInfo
      businessInfo: $businessInfo
      paymentTerms: $paymentTerms
      status: $status
      notes: $notes
    ) {
      id
      name
      contactInfo {
        email
        phone
      }
      status
    }
  }
`;

const DELETE_SUPPLIER_MUTATION = gql`
  mutation DeleteSupplier($id: ID!) {
    deleteSupplier(id: $id)
  }
`;

function Suppliers() {
  const { loading: queryLoading, error, data, refetch } = useQuery(GET_SUPPLIERS);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    contactInfo: {
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Argentina",
      },
    },
    businessInfo: {
      businessName: "",
      taxCategory: "",
      taxStatus: "",
      cuit: "",
    },
    paymentTerms: 30,
    notes: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteSupplierId, setDeleteSupplierId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    contactInfo: {
      email: "",
      phone: "",
    },
    status: "",
    notes: "",
  });
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  const steps = ['Información Básica', 'Contacto', 'Información Empresarial'];

  const [createSupplier, { loading: mutationLoading }] = useMutation(
    CREATE_SUPPLIER_MUTATION,
    {
      onCompleted: () => {
        refetch();
        setFormData({
          name: "",
          contactInfo: {
            email: "",
            phone: "",
            address: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "Argentina",
            },
          },
          businessInfo: {
            businessName: "",
            taxCategory: "",
            taxStatus: "",
            cuit: "",
          },
          paymentTerms: 30,
          notes: "",
        });
        setActiveStep(0);
      },
      onError: (error) => {
        console.error("Error al crear proveedor:", error);
      },
    }
  );

  const [updateSupplier] = useMutation(UPDATE_SUPPLIER_MUTATION, {
    onCompleted: () => {
      setEditingSupplier(null);
      refetch();
    },
  });

  const [deleteSupplier] = useMutation(DELETE_SUPPLIER_MUTATION, {
    onCompleted: () => {
      setDeleteSupplierId(null);
      refetch();
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contactInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value,
        },
      }));
    } else if (name.startsWith("contactInfo.address.")) {
      const field = name.split(".")[2];
      setFormData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          address: {
            ...prev.contactInfo.address,
            [field]: value,
          },
        },
      }));
    } else if (name.startsWith("businessInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        businessInfo: {
          ...prev.businessInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createSupplier({
      variables: {
        ...formData,
        paymentTerms: parseInt(formData.paymentTerms),
      },
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredSuppliers = React.useMemo(() => {
    const suppliers = data?.suppliers ?? [];
    return suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.businessInfo?.cuit &&
          supplier.businessInfo.cuit.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const paginatedSuppliers = React.useMemo(() => {
    return filteredSuppliers.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredSuppliers, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (supplier) => {
    setEditingSupplier(supplier);
    setEditFormData({
      name: supplier.name,
      contactInfo: {
        email: supplier.contactInfo.email,
        phone: supplier.contactInfo.phone,
      },
      status: supplier.status,
      notes: supplier.notes || "",
    });
  };

  const handleDeleteClick = (supplierId) => {
    setDeleteSupplierId(supplierId);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateSupplier({
      variables: {
        id: editingSupplier.id,
        name: editFormData.name,
        contactInfo: editFormData.contactInfo,
        status: editFormData.status,
        notes: editFormData.notes,
      },
    });
  };

  const handleDeleteConfirm = () => {
    deleteSupplier({
      variables: {
        id: deleteSupplierId,
      },
    });
  };

  const handleExportClick = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const exportToExcel = () => {
    const data = filteredSuppliers.map((supplier) => ({
      Nombre: supplier.name,
      Email: supplier.contactInfo.email,
      Teléfono: supplier.contactInfo.phone,
      "Razón Social": supplier.businessInfo?.businessName || "",
      CUIT: supplier.businessInfo?.cuit || "",
      "Términos de Pago": `${supplier.paymentTerms} días`,
      Estado: supplier.status === "active" ? "Activo" : "Inactivo",
      Fecha: new Date(supplier.createdAt).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Proveedores");
    XLSX.writeFile(wb, "proveedores.xlsx");
    handleExportClose();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Reporte de Proveedores", 14, 15);

    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableData = filteredSuppliers.map((supplier) => [
      supplier.name,
      supplier.contactInfo.email,
      supplier.contactInfo.phone,
      supplier.businessInfo?.businessName || "",
      supplier.businessInfo?.cuit || "",
      `${supplier.paymentTerms} días`,
      supplier.status === "active" ? "Activo" : "Inactivo",
    ]);

    doc.autoTable({
      head: [
        [
          "Nombre",
          "Email",
          "Teléfono",
          "Razón Social",
          "CUIT",
          "Términos de Pago",
          "Estado",
        ],
      ],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save("proveedores.pdf");
    handleExportClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Proveedor"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Términos de Pago (días)"
                name="paymentTerms"
                type="number"
                value={formData.paymentTerms}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Notas"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                variant="outlined"
                placeholder="Información adicional sobre el proveedor..."
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="contactInfo.email"
                type="email"
                value={formData.contactInfo.email}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip icon={<LocationIcon />} label="Dirección" color="primary" />
              </Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Calle"
                name="contactInfo.address.street"
                value={formData.contactInfo.address.street}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                name="contactInfo.address.city"
                value={formData.contactInfo.address.city}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Estado/Provincia"
                name="contactInfo.address.state"
                value={formData.contactInfo.address.state}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Código Postal"
                name="contactInfo.address.zipCode"
                value={formData.contactInfo.address.zipCode}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="País"
                name="contactInfo.address.country"
                value={formData.contactInfo.address.country}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip icon={<AccountBalanceIcon />} label="Información Empresarial" color="primary" />
              </Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Razón Social"
                name="businessInfo.businessName"
                value={formData.businessInfo.businessName}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CUIT"
                name="businessInfo.cuit"
                value={formData.businessInfo.cuit}
                onChange={handleChange}
                variant="outlined"
                placeholder="XX-XXXXXXXX-X"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Categoría Impositiva"
                name="businessInfo.taxCategory"
                value={formData.businessInfo.taxCategory}
                onChange={handleChange}
                variant="outlined"
                select
              >
                <MenuItem value="Responsable Inscripto">Responsable Inscripto</MenuItem>
                <MenuItem value="Monotributo">Monotributo</MenuItem>
                <MenuItem value="Exento">Exento</MenuItem>
                <MenuItem value="No Responsable">No Responsable</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estado Impositivo"
                name="businessInfo.taxStatus"
                value={formData.businessInfo.taxStatus}
                onChange={handleChange}
                variant="outlined"
                select
              >
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="Inactivo">Inactivo</MenuItem>
                <MenuItem value="Suspendido">Suspendido</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );
      default:
        return 'Paso desconocido';
    }
  };

  if (error)
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error al cargar los proveedores: {error.message}
        </Alert>
      </Container>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold', 
          background: 'linear-gradient(45deg, #7B1FA2, #AB47BC)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}>
          🏢 Gestión de Proveedores
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Administra los proveedores del sistema agropecuario
        </Typography>
      </Box>

      {/* Formulario Nuevo Proveedor */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon color="primary" />
              Nuevo Proveedor
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleExportClick}
                startIcon={<FileDownloadIcon />}
                sx={{ borderRadius: 2 }}
              >
                Exportar
              </Button>
              <Menu
                anchorEl={exportMenuAnchor}
                open={Boolean(exportMenuAnchor)}
                onClose={handleExportClose}
              >
                <MenuItem onClick={exportToExcel}>
                  <ExcelIcon sx={{ mr: 1 }} /> Exportar a Excel
                </MenuItem>
                <MenuItem onClick={exportToPDF}>
                  <PdfIcon sx={{ mr: 1 }} /> Exportar a PDF
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mb: 3 }}>
              {renderStepContent(activeStep)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Atrás
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={mutationLoading}
                    startIcon={<BusinessIcon />}
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    {mutationLoading ? "Creando proveedor..." : "Crear Proveedor"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    Siguiente
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Listado de Proveedores */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            📋 Listado de Proveedores
          </Typography>

          {/* Filtros y Búsqueda */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Buscar proveedores"
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClearSearch} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Filtrar por estado"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                variant="outlined"
              >
                <MenuItem value="all">Todos los estados</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
                <MenuItem value="blocked">Bloqueado</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {queryLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Mostrando {filteredSuppliers?.length} de {data?.suppliers.length} proveedores
              </Typography>
              <TableContainer sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "name"}
                          direction={orderBy === "name" ? order : "asc"}
                          onClick={() => handleRequestSort("name")}
                        >
                          Nombre
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell>Razón Social</TableCell>
                      <TableCell>CUIT</TableCell>
                      <TableCell>Términos de Pago</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "status"}
                          direction={orderBy === "status" ? order : "asc"}
                          onClick={() => handleRequestSort("status")}
                        >
                          Estado
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSuppliers?.map((supplier) => (
                      <TableRow key={supplier.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon color="primary" fontSize="small" />
                            <Typography variant="body2" fontWeight={500}>
                              {supplier.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon fontSize="small" color="action" />
                            {supplier.contactInfo.email}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            {supplier.contactInfo.phone}
                          </Box>
                        </TableCell>
                        <TableCell>{supplier.businessInfo?.businessName || "-"}</TableCell>
                        <TableCell>{supplier.businessInfo?.cuit || "-"}</TableCell>
                        <TableCell>{supplier.paymentTerms} días</TableCell>
                        <TableCell>
                          <Chip
                            label={supplier.status === 'active' ? 'Activo' : 'Inactivo'}
                            color={supplier.status === 'active' ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(supplier)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(supplier.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredSuppliers?.length || 0}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingSupplier}
        onClose={() => setEditingSupplier(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" />
            Editar Proveedor
          </Box>
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editFormData.contactInfo.email}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      contactInfo: {
                        ...editFormData.contactInfo,
                        email: e.target.value,
                      },
                    })
                  }
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={editFormData.contactInfo.phone}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      contactInfo: {
                        ...editFormData.contactInfo,
                        phone: e.target.value,
                      },
                    })
                  }
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Estado"
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  required
                  variant="outlined"
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                  <MenuItem value="blocked">Bloqueado</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notas"
                  multiline
                  rows={3}
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setEditingSupplier(null)} sx={{ borderRadius: 2 }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2 }}>
              Guardar Cambios
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!deleteSupplierId} 
        onClose={() => setDeleteSupplierId(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar este proveedor? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDeleteSupplierId(null)} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Suppliers;
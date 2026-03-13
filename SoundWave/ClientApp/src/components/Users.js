import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@material-ui/data-grid';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
const theme = createMuiTheme({
    palette: {
        type: 'dark',
    },
    overrides: {
        MuiDataGrid: {
            root: {
                '& .MuiDataGrid-cell': {
                    color: 'white',
                    backgroundColor: 'transparent',
                },
                '& .MuiDataGrid-columnHeader': {
                    color: 'white',
                    backgroundColor: 'transparent',
                },
                '& .MuiDataGrid-cellEditing': {
                    backgroundColor: 'transparent',
                },
                '& .MuiCheckbox-root': {
                    color: 'white',
                },
            },
        },
    },
});
export function Users() {
    const [users, setUsers] = useState([]);
    const username = localStorage.getItem('username');
    useEffect(() => {
        axios.get('/user')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error(`Error fetching users: ${error}`);
            });
    }, []);

    const columns = [
        { field: 'name', headerName: 'Имя', flex: 1, editable: true },
        { field: 'email', headerName: 'Email', flex: 1, editable: true },
        { field: 'password', headerName: 'Пароль', flex: 1, editable: true },
        {
            field: 'actions',
            headerName: 'Действия',
            width: 150,
            renderCell: (params) => (
                <strong>
                    {params.row.userID !== 1 && <button onClick={() => handleDelete(params.row.id)}>Delete</button>}
                </strong>
            ),
        },
    ];

    const handleEdit = (params) => {
        const { id, field, value } = params;

        const user = users.find(user => user.userID === id);
        const oldDirName = `${id}${user.name}`;

        const updatedUser = { ...user, [field]: value };

        axios.put(`/user/${id}`, updatedUser)
            .then(() => {
                setUsers(users.map(user => user.userID === id ? { ...user, [field]: value } : user));

                if (field === 'name') {
                    const newDirName = `${id}${value}`;

                    axios.put(`/directory/${oldDirName}/${newDirName}`)
                        .then(() => {
                            console.log('Directory successfully renamed');
                        })
                        .catch(error => {
                            console.error(`Error renaming the directory: ${error}`);
                        });
                    if (username == user.name) {
                        localStorage.setItem('username', value);
                    }
                }
            })
            .catch(error => {
                console.error(`Error editing user: ${error}`);
            });
    };

    const handleDelete = (id) => {
        if (id !== 1) {
            axios.delete(`/user/${id}`)
                .then(() => {
                    setUsers(users.filter(user => user.userID !== id));
                })
                .catch(error => {
                    console.error(`Error deleting user: ${error}`);
                });
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <div style={{ height: 400, width: '100%', overflow: 'hidden' }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    pageSize={5}
                    checkboxSelection
                    disableSelectionOnClick
                    getRowId={(row) => row.userID}
                    onCellEditCommit={handleEdit}
                />
            </div>
        </ThemeProvider>
    );

}

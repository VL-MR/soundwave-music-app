import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions } from '@material-ui/core';
export function Profile() {
    const [user, setUser] = useState(null);
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const userID = localStorage.getItem('userID');
    const username = localStorage.getItem('username');
    useEffect(() => {
        if (userID) {
            axios.get(`/user/${userID}`)
                .then(response => {
                    setUser(response.data);
                })
                .catch(error => {
                    console.error(`Error getting user: ${error}`);
                });
        }
    }, [userID]);

    const handleEdit = (params) => {
        const { id, field, value } = params;

        const oldDirName = `${id}${user.name}`;

        const updatedUser = { ...user, [field]: value };

        axios.put(`/user/${id}`, updatedUser)
            .then(() => {
                setUser(updatedUser);

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
            setOpen(true);
            setSelectedUser(id);
        }
    };

    const confirmDelete = () => {
        axios.delete(`/user/${selectedUser}`)
            .then(() => {
                setUser(null);
                setOpen(false);
            })
            .catch(error => {
                console.error(`Error deleting user: ${error}`);
            });
    };


    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            {user && (
                <div style={{ display: 'flex', flexDirection: 'column'} }>
                    <TextField label="Имя" defaultValue={user.name} onBlur={(e) => handleEdit({ id: user.userID, field: 'name', value: e.target.value })} />
                    <TextField label="Пароль" defaultValue={user.password} onBlur={(e) => handleEdit({ id: user.userID, field: 'password', value: e.target.value })} />
                    <TextField label="Почта" defaultValue={user.email} onBlur={(e) => handleEdit({ id: user.userID, field: 'email', value: e.target.value })} />
                    {userID != 1 && (
                        <Button onClick={() => handleDelete(user.userID)}>Удалить пользователя</Button>
                    )}
                </div>
            )}
            <Button onClick={() => {
                localStorage.clear();
                window.history.pushState(null, null, '/');
                window.location.href = '/';
            }}>Выйти из сессии</Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Удалить пользователя</DialogTitle>
                <DialogContent>
                    Вы уверены, что хотите удалить этого пользователя?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Отмена</Button>
                    <Button onClick={confirmDelete}>Удалить</Button>
                </DialogActions>
            </Dialog>
        </div>
    );

}

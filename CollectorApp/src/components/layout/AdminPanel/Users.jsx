import { useState, useEffect } from 'react';
import { Checkbox } from '../../ui/checkbox';
import axios from 'axios';
import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { GoTriangleDown, GoTriangleUp } from 'react-icons/go';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selection, setSelection] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // Przechowujemy wybranego użytkownika, aby wysłać do niego wiadomość

  // Sortowanie użytkowników
  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key]?.toLowerCase() || '';
    const bValue = b[sortConfig.key]?.toLowerCase() || '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  // Sortowanie użytkowników po kluczu
  const handleSort = (key) => {
    console.log('Sortowanie po kluczu:', key);
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? (
        <GoTriangleUp />
      ) : (
        <GoTriangleDown />
      );
    }
    return null;
  };

  // Pobieranie użytkowników i sprawdzanie uprawnień administratora
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Brak tokenu użytkownika.');
      return;
    }

    axios
      .get('http://localhost:10000/user-info', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        if (response.data.status === 'admin') {
          setIsAdmin(true);
          return axios.get('http://localhost:10000/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          alert('Nie masz uprawnień administratora.');
          return Promise.reject();
        }
      })
      .then((res) => setUsers(res.data))
      .catch((error) => {
        if (error?.response?.status === 401) {
          alert('Sesja wygasła. Zaloguj się ponownie.');
        }
        console.error('Błąd pobierania użytkowników', error);
      });
  }, []);

  // Usuwanie pojedynczego użytkownika
  const deleteUser = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Brak tokenu użytkownika.');
      return;
    }

    if (!window.confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:10000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      alert('Użytkownik został usunięty.');
    } catch (error) {
      console.error('Błąd usuwania użytkownika', error);
      alert(
        error.response?.data?.message || 'Nie udało się usunąć użytkownika.'
      );
    }
  };

  // Wysyłanie wiadomości
  const sendMessage = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Brak tokenu użytkownika.');
      return;
    }
    try {
      await axios.post(
        'http://localhost:10000/send-message',
        {
          receiverId: selectedUser._id,
          title: messageTitle,
          content: messageContent
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Wiadomość została wysłana.');
      setMessageTitle('');
      setMessageContent('');
      setSelectedUser(null); // Resetujemy wybranego użytkownika
    } catch (error) {
      console.error('Błąd wysyłania wiadomości', error);
      alert('Nie udało się wysłać wiadomości.');
    }
  };

  // Edytowanie użytkownika
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditStatus(user.status);
    setEditPassword('');
  };

  // Aktualizowanie danych użytkownika
  const updateUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Brak tokenu użytkownika.');
      return;
    }
    const updatedUser = {
      username: editUsername,
      email: editEmail,
      password: editPassword,
      status: editStatus
    };

    try {
      await axios.put(
        `http://localhost:10000/admin/users/${editingUser._id}`,
        updatedUser,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Aktualizowanie stanu użytkowników
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === editingUser._id ? { ...user, ...updatedUser } : user
        )
      );
      setEditingUser(null);
      alert('Dane użytkownika zostały zaktualizowane.');
    } catch (error) {
      console.error('Błąd aktualizacji użytkownika', error);
      alert(
        error.response?.data?.message ||
          'Nie udało się zaktualizować danych użytkownika.'
      );
    }
  };

  // Wybór użytkownika do wysłania wiadomości
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setMessageTitle('');
    setMessageContent('');
  };

  // Funkcja usuwania wielu użytkowników
  const handleBulkDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Brak tokenu użytkownika.');
      return;
    }

    if (
      !window.confirm('Czy na pewno chcesz usunąć zaznaczonych użytkowników?')
    ) {
      return;
    }
    try {
      await axios.post(
        'http://localhost:10000/admin/users/bulk-delete',
        { userIds: selection },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prevUsers) =>
        prevUsers.filter((user) => !selection.includes(user._id))
      );
      setSelection([]); // Resetowanie zaznaczenia
      alert('Zaznaczeni użytkownicy zostali usunięci.');
    } catch (error) {
      console.error('Błąd usuwania użytkowników', error);
      alert('Nie udało się usunąć użytkowników.');
    }
  };
  return (
    <Flex
      width={'100%'}
      height={'90vh'}
      overflow={'auto'}
      flexDir={'column'}
      backgroundColor={'white'}
      textAlign={'center'}
      bgImage={
        'linear-gradient(90deg, rgba(105,127,141,1) 0%, rgba(97,120,134,1) 35%, rgba(70,93,109,1) 80%, rgba(58,79,96,1) 100%);'
      }
    >
      <Flex
        justifyContent="center"
        alignItems="center"
        flexDir={'column'}
        gap={'2rem'}
        padding={'2rem'}
        color={'white'}
      >
        <Heading
          fontSize={'30px'}
          sm={{ fontSize: '40px' }}
          md={{ fontSize: '50px' }}
        >
          Lista użytkowników
        </Heading>
      </Flex>

      {editingUser && (
        <Flex
          justifyContent="center"
          alignItems="center"
          flexDir={'column'}
          textAlign={'left'}
          padding={'2rem'}
        >
          <h3>Edytuj użytkownika</h3>
          <Box
            padding={'2rem'}
            boxShadow={'0 4px 8px rgba(0, 0, 0, 0.4)'}
            rounded={'2xl'}
          >
            <form onSubmit={(e) => e.preventDefault()}>
              <Flex
                justifyContent="space-between"
                alignItems="center"
                width={'300px'}
              >
                <label
                  style={{
                    fontSize: '1rem', // Wielkość czcionki
                    fontWeight: 'bold', // Pogrubienie etykiety
                    marginRight: '10px', // Odstęp między etykietą a polem tekstowym
                    color: '#FFFFFF' // Kolor tekstu etykiety
                  }}
                >
                  Nazwa:
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  style={{
                    background: '#f4f4f4', // Jasnoszare tło
                    border: '1px solid #ccc', // Szare obramowanie
                    borderRadius: '4px', // Zaokrąglone rogi
                    padding: '0.5rem', // Wygodne wypełnienie
                    fontSize: '1rem', // Wielkość czcionki
                    width: '200px', // Szerokość inputa
                    margin: '0.2rem', // Odstępy wewnętrzne
                    transition: 'border-color 0.3s ease' // Przejście dla obramowania
                  }}
                />
              </Flex>
              <Flex
                justifyContent="space-between"
                alignItems="center"
                width={'300px'}
              >
                <label
                  style={{
                    fontSize: '1rem', // Wielkość czcionki
                    fontWeight: 'bold', // Pogrubienie etykiety
                    marginRight: '10px', // Odstęp między etykietą a polem tekstowym
                    color: '#FFFFFF' // Kolor tekstu etykiety
                  }}
                >
                  Email:
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{
                    background: '#f4f4f4', // Jasnoszare tło
                    border: '1px solid #ccc', // Szare obramowanie
                    borderRadius: '4px', // Zaokrąglone rogi
                    padding: '0.5rem', // Wygodne wypełnienie
                    fontSize: '1rem', // Wielkość czcionki
                    width: '200px', // Szerokość inputa
                    margin: '0.2rem', // Odstępy wewnętrzne
                    transition: 'border-color 0.3s ease' // Przejście dla obramowania
                  }}
                />
              </Flex>
              <Flex
                justifyContent="space-between"
                alignItems="center"
                width={'300px'}
              >
                <label
                  style={{
                    fontSize: '1rem', // Wielkość czcionki
                    fontWeight: 'bold', // Pogrubienie etykiety
                    marginRight: '10px', // Odstęp między etykietą a polem tekstowym
                    color: '#FFFFFF' // Kolor tekstu etykiety
                  }}
                >
                  Hasło:
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  style={{
                    background: '#f4f4f4', // Jasnoszare tło
                    border: '1px solid #ccc', // Szare obramowanie
                    borderRadius: '4px', // Zaokrąglone rogi
                    padding: '0.5rem', // Wygodne wypełnienie
                    fontSize: '1rem', // Wielkość czcionki
                    width: '200px', // Szerokość inputa
                    margin: '0.2rem', // Odstępy wewnętrzne
                    transition: 'border-color 0.3s ease' // Przejście dla obramowania
                  }}
                />
              </Flex>
              <Flex
                justifyContent="space-between"
                alignItems="center"
                width={'300px'}
              >
                <label
                  style={{
                    fontSize: '1rem', // Wielkość czcionki
                    fontWeight: 'bold', // Pogrubienie etykiety
                    marginRight: '10px', // Odstęp między etykietą a polem tekstowym
                    color: '#FFFFFF' // Kolor tekstu etykiety
                  }}
                >
                  Status:
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{
                    margin: '.2rem .5rem', // Odstęp od innych elementów
                    background: '#f4f4f4', // Jasnoszare tło
                    color: 'black', // Czarny kolor tekstu
                    padding: '0.5rem ', // Większe wypełnienie
                    marginBottom: '1rem', // Odstęp od dolnego elementu
                    border: '2px solid #ccc', // Jasnoszare obramowanie
                    borderRadius: '4px', // Zaokrąglone rogi
                    fontSize: '1rem', // Wielkość czcionki
                    cursor: 'pointer', // Kursor wskazujący
                    width: '200px', // Szerokość selecta
                    transition: 'all 0.3s ease' // Płynne przejście dla efektów
                  }}
                  onMouseOver={(e) => (e.target.style.borderColor = '#007bff')} // Zmiana koloru obramowania na niebieski na hover
                  onMouseOut={(e) => (e.target.style.borderColor = '#ccc')} // Powrót do początkowego koloru obramowania
                >
                  <option value="admin">Admin</option>
                  <option value="user">Użytkownik</option>
                  <option value="expert">Expert</option>
                </select>
              </Flex>
              <Flex justifyContent="space-between" alignItems="center">
                <button
                  onClick={updateUser}
                  style={{
                    fontSize: '1rem', // Wielkość czcionki
                    backgroundColor: 'red', // Tło na czerwono
                    color: 'white', // Kolor tekstu na biały
                    border: 'none', // Brak obramowania
                    padding: '0.5rem 1rem', // Wygodne wypełnienie
                    borderRadius: '8px', // Zaokrąglone rogi
                    cursor: 'pointer', // Kursor wskazujący, że to przycisk
                    transition: 'background-color 0.3s ease' // Płynne przejście
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = 'darkred')
                  } // Zmiana koloru tła na ciemniejszy na hover
                  onMouseOut={(e) => (e.target.style.backgroundColor = 'red')} // Powrót do początkowego koloru
                >
                  Zaktualizuj użytkownika
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  style={{
                    backgroundColor: 'blue',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                    fontSize: '1rem'
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = 'darkblue')
                  }
                  onMouseOut={(e) => (e.target.style.backgroundColor = 'blue')}
                >
                  Anuluj
                </button>
              </Flex>
            </form>
          </Box>
        </Flex>
      )}

      <table style={{ textAlign: 'left' }}>
        <thead
          style={{
            borderBottom: '2px solid blue',
            color: 'blue',
            textAlign: 'left',
            boxShadow: '0 2px 4px rgba(0, 0, 255, 0.4)', // Cień na dolnej krawędzi
            padding: '1rem' // Wygodne wypełnienie
          }}
        >
          <tr>
            <th>
              <Checkbox
                padding={'1rem'}
                variant={'subtle'}
                checked={
                  selection.length > 0 && selection.length === users.length
                }
                onChange={() =>
                  setSelection(
                    selection.length === users.length
                      ? []
                      : users.map((u) => u._id)
                  )
                }
              />
            </th>
            <th
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('username')} // Sorting by username
            >
              <Flex justifyContent={'center'} alignItems={'center'}>
                Użytkownik {getSortIcon('username')}
              </Flex>
            </th>
            <th
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('email')} // Sorting by email
            >
              <Flex justifyContent={'center'} alignItems={'center'}>
                Email {getSortIcon('email')}
              </Flex>
            </th>
            <th
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('status')} // Sorting by status
            >
              <Flex justifyContent={'center'} alignItems={'center'}>
                Status {getSortIcon('status')}
              </Flex>
            </th>

            <th>
              <Flex justifyContent={'center'} alignItems={'center'}>
                Akcje
              </Flex>
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedUsers.map((user) => (
            <tr
              style={{
                margin: '1rem',
                color: 'white',
                borderBottom: '1px solid gray',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)' // Cień na dolnej krawędzi
              }}
              key={user._id}
            >
              <td>
                <Checkbox
                  variant={'subtle'}
                  checked={selection.includes(user._id)}
                  padding={'1rem'}
                  onChange={() =>
                    setSelection(
                      selection.includes(user._id)
                        ? selection.filter((id) => id !== user._id)
                        : [...selection, user._id]
                    )
                  }
                />
              </td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.status}</td>
              <td>
                <Flex flexDir={'row'} justifyContent={'center'}>
                  <Button
                    onClick={() => handleEditUser(user)}
                    size={'2xl'}
                    style={{
                      backgroundColor: '#007bff', // Szare tło
                      color: '#FFFFFF', // Niebieski tekst
                      border: '2px solid #007bff', // Niebieska ramka
                      borderRadius: '5px', // Zaokrąglone rogi
                      padding: '0.75rem 1.5rem', // Wygodne wypełnienie
                      margin: '.2rem .5rem', // Odstęp od innych elementów
                      fontWeight: 'bold', // Pogrubiony tekst
                      cursor: 'pointer', // Zmieniony kursor na wskaźnik
                      transition: 'background-color 0.3s ease, border 0.3s ease' // Płynne przejście efektów
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = 'rgb(22, 103, 184)'; // Zmiana tła na ciemniejsze przy najechaniu
                      e.target.style.border = '2px solid rgb(22, 103, 184)'; // Zmiana ramki
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#007bff'; // Przywrócenie początkowego tła
                      e.target.style.border = '2px solid #007bff'; // Przywrócenie początkowej ramki
                    }}
                  >
                    Edytuj
                  </Button>
                  <Button
                    onClick={() => deleteUser(user._id)}
                    size={'2xl'}
                    style={{
                      backgroundColor: '#dc3545', // Czerwone tło
                      color: 'white', // Biały tekst
                      border: '2px solid #dc3545', // Czerwona ramka
                      borderRadius: '5px', // Zaokrąglone rogi
                      padding: '0.75rem 1.5rem', // Wygodne wypełnienie
                      margin: '.2rem .5rem', // Odstęp od innych elementów
                      fontWeight: 'bold', // Pogrubiony tekst
                      cursor: 'pointer', // Zmieniony kursor na wskaźnik
                      transition: 'background-color 0.3s ease, border 0.3s ease' // Płynne przejście efektów
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#c82333'; // Zmiana tła na ciemniejsze przy najechaniu
                      e.target.style.border = '2px solid #c82333'; // Zmiana ramki
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#dc3545'; // Przywrócenie początkowego tła
                      e.target.style.border = '2px solid #dc3545'; // Przywrócenie początkowej ramki
                    }}
                  >
                    Usuń
                  </Button>
                </Flex>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && (
        <div style={{ marginTop: '20px' }}>
          <h3>Wyślij wiadomość do {selectedUser.username}</h3>
          <div>
            <label>Tytuł</label>
            <input
              type="text"
              value={messageTitle}
              onChange={(e) => setMessageTitle(e.target.value)}
              placeholder="Tytuł wiadomości"
              style={{ padding: '.5rem', margin: '.5rem 0', width: '100%' }}
            />
          </div>
          <div>
            <label>Treść wiadomości</label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Treść wiadomości"
              style={{ padding: '.5rem', margin: '.5rem 0', width: '100%' }}
            />
          </div>
          <button
            onClick={sendMessage}
            style={{
              background: 'blue',
              color: 'white',
              padding: '.5rem 1rem'
            }}
          >
            Wyślij wiadomość
          </button>
        </div>
      )}
      <Flex justifyContent={'center'} alignItems={'center'}>
        <button
          onClick={handleBulkDelete}
          disabled={selection.length === 0}
          style={{
            marginTop: '2rem', // Wygodne wypełnienie
            background: '#007bff', // Niebieskie tło
            color: 'white', // Kolor tekstu na biały
            padding: '.5rem 1rem', // Wygodne wypełnienie
            margin: '.5rem', // Odstęp od innych elementów
            border: 'none', // Brak obramowania
            borderRadius: '8px', // Zaokrąglone rogi
            fontSize: '16px', // Wygodny rozmiar czcionki
            cursor: 'pointer', // Wskaźnik kursora zmienia się na wskazujący
            transition: 'all 0.3s ease', // Płynne przejście efektów
            boxShadow: '0 4px 8px rgba(0, 123, 255, 0.4)' // Efekt cienia
          }}
          onMouseOver={(e) => {
            e.target.style.boxShadow = '0 8px 16px rgba(0, 123, 255, 0.6)'; // Zmiana cienia na hover
          }}
          onMouseOut={(e) => {
            e.target.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.4)'; // Powrót do początkowego cienia
          }}
        >
          Usuń zaznaczonych użytkowników
        </button>
      </Flex>
    </Flex>
  );
};

export default Users;

import { useEffect, useState } from 'react';
import { Flex, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@chakra-ui/react';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:10000/users', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Token wygasł lub jest niepoprawny');
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Błąd pobierania danych użytkownika:', error);
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  // ============================================== DELETED ============================================== //

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:10000/users', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Błąd usuwania konta');

      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Flex
      direction="column"
      height="100%"
      minH={'90vh'} // Zapewnia pełną wysokość okna
      minW={'100%'}
      bgImage={'url(/coinFlip.png)'}
      backgroundSize={'cover'}
      backgroundPositionX={'center'}
      backgroundRepeat={'no-repeat'}
      justifyContent={'center'} // Centruj elementy w pionie
      alignItems={'center'} // Centruj elementy w poziomie
      sm={{ backgroundPositionX: '60%' }}
      md={{ backgroundPositionX: '90%' }}
      lg={{ backgroundPositionX: '100%' }}
    >
      <Flex
        className="container"
        direction="column"
        align="center" // Centruj elementy w poziomie
        justify="start" // Centruj elementy w pionie
        backgroundColor={'rgba(0, 0, 0, 0.6)'}
        filter={'drop-shadow(0 0 5px #000)'}
        width={'200px'}
        height={'200px'}
        padding={'10px'}
        borderRadius={'20px'}
        gap={'10%'}
        sm={{ width: '250px', height: '250px', gap: '5%' }}
        md={{ width: '400px', height: '400px', gap: '5%' }}
        lg={{ width: '500px', height: '500px', gap: '5%' }}
      >
        <Heading
          color={'white'}
          fontSize={'24px'}
          paddingBottom={'5px'}
          sm={{ fontSize: '32px', padding: '10px' }}
          md={{ fontSize: '40px', padding: '20px' }}
          lg={{ fontSize: '60px', padding: '30px' }}
        >
          Witaj {userData?.username}
        </Heading>

        {loading && <p>Ładowanie danych...</p>}
        {error && <p style={{ color: 'red' }}>Błąd: {error}</p>}

        {userData && (
          <Flex
            mt={5}
            width="100%"
            color={'white'}
            justifyContent={'center'}
            flexDirection={'column'}
            alignItems="center"
            gap={5}
          >
            <Flex
              align="center"
              gap={6}
              className="profile"
              paddingLeft={4}
              paddingRight={4}
              md={{ marginTop: '10%' }}
              lg={{ marginTop: '15%' }}
            >
              <Avatar.Root size={'xl'} lg={{ size: 'lg' }}>
                <Avatar.Fallback
                  name={userData.username}
                  style={{ fontSize: '16px' }}
                />
                <Avatar.Image src={userData.avatar} />
              </Avatar.Root>
              <Stack gap="0">
                <Text
                  fontWeight="medium"
                  sm={{ fontSize: '20px' }}
                  md={{ fontSize: '24px' }}
                >
                  {userData.username}
                </Text>
                <Text
                  color="fg.muted"
                  textStyle="md"
                  sm={{ fontSize: '16px' }}
                  md={{ fontSize: '20px' }}
                >
                  {userData.email}
                </Text>
              </Stack>
            </Flex>

            <Flex
              gap={4}
              mt={4}
              flexDir={'column'}
              sm={{ gap: 6 }}
              md={{ gap: 8, marginTop: '15%' }}
            >
              <Button
                onClick={handleDeleteAccount}
                size="lg"
                fontSize="lg"
                bg="red.600"
                color="white"
                _hover={{ bg: 'red.700', boxShadow: 'md' }}
                borderRadius="md"
                paddingX={6}
                paddingY={4}
                sm={{ fontSize: '16px', width: '150px' }}
                md={{ fontSize: '24px', width: '200px', height: '40px' }}
              >
                Usuń konto
              </Button>

              <Button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                size="lg"
                fontSize="lg"
                bg="blue.600"
                color="white"
                _hover={{ bg: 'blue.700', boxShadow: 'md' }}
                borderRadius="md"
                paddingX={6}
                paddingY={4}
                sm={{ fontSize: '16px', width: '150px' }}
                md={{ fontSize: '24px', width: '200px', height: '40px' }}
              >
                Wyloguj się
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default Profile;

import { Link } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

const FooterLink = ({ to, children }) => {
  const navigate = useNavigate();

  return (
    <Link
      onClick={() => navigate(to)}
      //   backgroundImage={
      //     'linear-gradient(to top, rgb(179, 179, 179) 0.01px, transparent 0.5px)'
      //   }
      paddingRight={4}
      marginLeft={4}
      backgroundPosition="center center"
      _focus={{ outline: 'none' }}
      _hover={{
        color: 'blue.400'
      }}
      transition={'all ease-in-out 0.4s'}
      fontWeight={'bold'}
      color={'white'}
      fontSize={{ base: '12px', sm: '16px', md: '20px' }}
      borderRight={{ base: '1px solid gray', md: '1px solid gray' }}
      // margin={1}
    >
      {children}
    </Link>
  );
};

export default FooterLink;

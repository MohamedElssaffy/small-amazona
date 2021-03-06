import { makeStyles } from '@material-ui/core';

const useStyle = makeStyles((theme) => ({
  navbar: {
    backgroundColor: '#203040',
    '& a': {
      color: '#fff',
      marginLeft: 10,
    },
  },
  brand: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
  },
  grow: {
    flexGrow: 1,
  },
  main: {
    minHeight: '80vh',
  },
  footer: {
    textAlign: 'center',
    marginTop: 10,
  },
  section: {
    marginTop: 10,
    marginBottom: 10,
  },
  form: {
    width: '100%',
    maxWidth: 800,
    margin: '0 auto',
  },
  navButton: {
    color: '#fff',
    textTransform: 'initial',
  },
  transparentBg: {
    backgroundColor: 'transparent',
  },
  error: {
    color: '#f04040',
  },
  fullWidth: {
    width: '100%',
  },
  reviewForm: {
    maxWidth: 800,
    width: '100%',
  },
  reviewItem: {
    marginRight: '1rem',
    borderRight: '1px #808080 solid',
    paddingRight: '1rem',
  },
  toolbar: {
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 0,
  },
  searchSection: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  searchForm: {
    backgroundColor: '#fff',
    border: '1px solid #fff',
    borderRadius: 5,
  },
  searchInput: {
    paddingLeft: 5,
    color: '#000',
    '& ::placeholder': {
      color: '#606060',
    },
  },
  iconButton: {
    backgroundColor: '#f8c040',
    padding: 5,
    borderRadius: '0 5px 5px 0',
    '& span': {
      color: '#000',
    },
  },
  sort: {
    marginRight: 5,
  },
  carousel: {
    marginTop: '1rem',
    width: '100%',
    hegith: '100%',
    '& img': {
      width: '100%',
      hegith: '80%',
    },
  },
  mt1: {
    marginTop: '1rem',
  },
}));

export default useStyle;

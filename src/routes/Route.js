
import Home from "../pages/home/Home";
import Section from '../pages/section/Section';
import NotFound from '../components/notFound/NotFound';

export const routes = [
  {
    path: '/',
    Element: Home,
  },
  {
    path: '/home',
    Element: Home,
  },
  {
    path: '/section',
    Element: Section,
  },
  {
    path: '*',
    Element: NotFound,
  },
];
import App from '@/components/App';
import questions from '../../data/questions.json';
import signs from '../../data/signs.json';
import type {Question,Sign} from '@/lib/types';
export default function Page(){return <App questions={questions as Question[]} signs={signs as Sign[]}/>;}

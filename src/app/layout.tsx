import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Roadwise — Know the road.',description:'Indian road signs and driving rules. Practise, take a test and track your progress.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}

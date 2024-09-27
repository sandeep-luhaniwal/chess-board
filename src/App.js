import './App.css';
import Referee from './components/Referee/Referee';

function App() {
  return (
    <div className='h-[700px] overflow-hidden'>
      <div id="app" className='bg-emerald-900 flex flex-col items-center justify-center  relative'>
        <Referee />
      </div>
    </div>
  );
}

export default App;

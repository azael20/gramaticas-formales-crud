import { Button } from '@rewind-ui/core';
import React from 'react'
import { IoSaveOutline } from 'react-icons/io5';

interface Rule {
  nonTerminal: string;
  production: string;
}

interface CardProps {
  onSaveChanges: () => void,
  onEditChanges: () => void,
  onDeleteChanges: () => void,
  grammarName: string;
  rules: Rule[];

}

export const Card = (
  {
    onSaveChanges,
    onEditChanges,
    onDeleteChanges,
    grammarName,
    rules
  }: CardProps
) => {
  return (
    <div className="w-70 h-80 bg-zinc-200 rounded-xl my-4 text-black font-semibold flex flex-col justify-between">
      <div className='p-5'>
        <Button
          onClick={onSaveChanges}
          className='bg-green-500 justify-end hover:bg-green-600 active:bg-green-500 focus:bg-green-500'
        >
          <IoSaveOutline className='text-gray-800 text-xl' />
        </Button>
        <h1 className='text-center text-xl'>{grammarName}</h1>
        <div className='bg-black w-full h-0.5 my-3' />
        {rules.map((rule, index) => (
          <p key={index}>{index + 1}. {rule.nonTerminal} {'→'} {rule.production}</p>
        ))}
      </div>

      <div>
        <Button
          className='bg-blue-600 w-1/2 rounded-tl-none rounded-r-none h-12 text-zinc-50'
          onClick={onEditChanges}
        >
          Editar
        </Button>
        <Button
          className='bg-red-600 w-1/2 rounded-tr-none rounded-l-none h-12 text-zinc-50'
          onClick={onDeleteChanges}
        >
          Borrar
        </Button>
      </div>
    </div>
  )
}

import { ChangeEvent, useRef, useState } from "react";
import { Card } from "./components/Card"
import { Button, Modal } from "@rewind-ui/core";
import { saveAs } from 'file-saver';

interface Rule {
  nonTerminal: string;
  production: string;
}

interface Grammar {
  name: string;
  rules: Rule[];
}

const App = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [nonTerminal, setNonTerminal] = useState<string>('');
  const [production, setProduction] = useState<string>('');
  const [rules, setRules] = useState<Rule[]>([])
  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [openEditRuleModal, setOpenEditRuleModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<null | File>(null);
  const [rulePosition, setRulePosition] = useState<number | null>(null);
  const inputRef = useRef<any>();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const result = event.target.value.replace(/[^a-z]/gi, '');
    setNonTerminal(result);
  }

  const blobParts = grammars.map(grammar => {
    const ruleStrings = grammar.rules.map(rule => `${rule.nonTerminal} -> ${rule.production}`);
    return `${grammar.name}\n\n${ruleStrings.join('\n')}`;
  });

  const createFile = (index: number) => {
    const blob = new Blob([blobParts[index]], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `grammar.txt`);
  }

  const loadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];

    if (!file) return;

    const fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.onload = () => {
      const content = fileReader.result as string;
      const lines = content.split('\n');

      // Obteniendo el título y las reglas
      const title = lines[0].trim();
      const ruleLines = lines.slice(1);

      // Procesar las reglas y crear una gramática
      const rulesFromFile: Rule[] = ruleLines.map(rule => {
        const [nonTerminal, production] = rule.trim().split('->').map(part => part.trim());
        return { nonTerminal, production };
      });

      // Crear la gramática con todas las reglas
      const grammarFromFile: Grammar = {
        name: title,
        rules: rulesFromFile,
      };

      // Actualizar el estado o realizar otras acciones
      setGrammars(prevGrammars => [...prevGrammars, grammarFromFile]);
    }

    fileReader.onerror = () => {
      console.log(fileReader.error);
    }
  }

  const onChooseFile = () => {
    inputRef.current.click();
  };


  return (
    <div>
      <div className="flex gap-4 justify-end">
        <Button
          onClick={() => {
            setIsEditing(false);
            setName('');
            setNonTerminal('');
            setProduction('');
            setRules([]);
            setOpenModal(true);
          }}
          className="p-4 rounded-md border-zinc-50 border"
        >
          <p>+ Crear Gramática</p>
        </Button>
        <div>
          <input
            type="file"
            ref={inputRef}
            onChange={loadFile}
            style={{ display: 'none' }}
          />
          <Button onClick={onChooseFile} className="p-4 rounded-md border-zinc-50 border">
            <span>+ Cargar Gramática</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-8">
        {grammars.map((grammar, index) => (
          <Card
            onSaveChanges={() => createFile(index)}
            onDeleteChanges={() => {
              const newGrammars = grammars.filter((_, i) => i !== index);
              setGrammars(newGrammars);
            }}
            onEditChanges={() => {
              setIsEditing(true);
              setOpenModal(true);
              setName(grammar.name);
              setRules(grammar.rules);
              setNonTerminal('');
              setProduction('');
            }}
            key={index}
            grammarName={grammar.name}
            rules={grammar.rules}
          />
        ))}
      </div>

      <Modal position="center" className="w-1/4" open={openModal}>
        <div className="p-4 w-full">
          <div className="text-end">
            <Button onClick={() => setOpenModal(false)} className="bg-transparent border border-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="gray"
                onClick={() => setOpenModal(false)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
          <form className="flex flex-col gap-4 mt-4">
            <input
              className="p-2 rounded-md border-zinc-50 border"
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              value={name}
              type="text"
              disabled={isEditing}
            />
            <div className="flex w-full items-center">
              <div className="flex flex-row gap-x-1">
                <Button onClick={() => setNonTerminal('Σ')} className="bg-slate-800">
                  Σ
                </Button>
                <input
                  maxLength={1}
                  type="text"
                  onChange={(e) => handleChange(e)}
                  value={nonTerminal}
                  className="w-full p-2 rounded-md border-zinc-50 border"
                />
              </div>
              <span className="text-black w-[30px] text-center text-xl font-bold">{'→'}</span>
              <div className="flex flex-row gap-x-1">
                <input
                  type="text"
                  onChange={(e) => setProduction(e.target.value)}
                  value={production} className="w-full p-2 rounded-md border-zinc-50 border"
                />
                <Button onClick={() => setProduction('λ')} className="bg-slate-800">
                  λ
                </Button>
              </div>
            </div>
            <Button
              className="bg-blue-600 text-zinc-50 h-12 rounded-md"
              onClick={() => {
                if (!nonTerminal || !production) return;
                setRules(prevRules => [...prevRules, { nonTerminal, production }]);

              }}
            >
              Agregar regla
            </Button>
            <div className="text-black font-semibold">
              <p>Reglas creadas:</p>
              {rules.map((rule, index) => (
                <div className="flex items-center" key={`r-${index}`}>
                  <p key={index}>{index + 1}. {rule.nonTerminal} {'→'} {rule.production}</p>
                  <Button
                    className="rounded-full w-4 h-4 ml-2 bg-red-600 hover:bg-red-800 focus:bg-red-800 active:bg-red-500 text-xs p-2 "
                    onClick={() => {
                      const newRules = rules.filter((_, i) => i !== index);
                      setRules(newRules);
                    }}
                  >
                    ✖
                  </Button>
                  <Button
                    className="rounded-full h-4 ml-2 bg-green-600 hover:bg-green-800 focus:bg-green-800 active:bg-green-500 text-xs p-2 "
                    onClick={() => {
                      setRulePosition(index);
                      setOpenEditRuleModal(true)
                      setNonTerminal(rule.nonTerminal);
                      setProduction(rule.production);
                    }}
                  >
                    Editar
                  </Button>
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                if (!name || !rules.length) return;

                if (isEditing) {
                  const newGrammars = grammars.map((grammar) => {
                    if (grammar.name === name) {
                      return { name, rules };
                    }
                    return grammar;
                  });
                  setGrammars(newGrammars);
                  setName('');
                  setRules([]);
                  setNonTerminal('');
                  setProduction('');
                  setOpenModal(false);
                  setIsEditing(false);
                  return;
                }
                setGrammars([...grammars, { name, rules }]);
                setName('');
                setRules([]);
                setOpenModal(false);

              }}
              className="bg-green-600 text-zinc-50 h-12 rounded-md"
            >
              {isEditing ? 'Guardar cambios' : 'Crear gramática'}
            </Button>
          </form>
        </div>
      </Modal>

      <Modal position="center" className="w-1/3 shadow-xl border" open={openEditRuleModal}>
        <div className="p-4 w-full">
          <div className="text-end">
            <Button onClick={() => setOpenEditRuleModal(false)} className="bg-transparent border border-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="gray"
                onClick={() => setOpenEditRuleModal(false)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
          <form className="flex flex-col gap-4 mt-4">
            <div className="flex w-full items-center">
              <div className="flex flex-row gap-x-1">
                <Button onClick={() => setNonTerminal('Σ')} className="bg-slate-800">
                  Σ
                </Button>
                <input
                  maxLength={1}
                  type="text"
                  onChange={(e) => handleChange(e)}
                  value={nonTerminal}
                  className="w-full p-2 rounded-md border-zinc-50 border"
                />
              </div>
              <span className="text-black w-[30px] text-center text-xl font-bold">{'→'}</span>
              <div className="flex flex-row gap-x-1">
                <input
                  type="text"
                  onChange={(e) => setProduction(e.target.value)}
                  value={production} className="w-full p-2 rounded-md border-zinc-50 border"
                />
                <Button onClick={() => setProduction('λ')} className="bg-slate-800">
                  λ
                </Button>
              </div>
            </div>
            <Button
              onClick={() => {
                if (!nonTerminal || !production) return;
                const newRules = rules.map((rule, index) => {
                  if (index === rulePosition) {
                    return { nonTerminal, production };
                  }
                  return rule;
                });
                setRules(newRules);
                setNonTerminal('');
                setProduction('');
                setOpenEditRuleModal(false);
              }}
              className="bg-green-600 text-zinc-50 h-12 rounded-md"
            >
              Guardar regla
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  )
}

export default App

/** @format */

import express from "express";
import { v4 } from "uuid";

const app = express();
const PORT = 3000;

app.use(express.json());

const USERS = [];

const userExist = (req, res, next) => {
  const { cpf } = req.params;
  const user = USERS.find((u) => u.cpf === cpf);
  if (!user) {
    res.status(404).json({ error: "user is not registered" });
    return;
  }
  req.user = user;
  return next();
};

const cpfAlreadyExists = (req, res, next) => {
  const { cpf } = req.body;
  for (let i = 0; i < USERS.length; i++) {
    if (USERS[i].cpf === cpf) {
      res.status(422).json({ error: "user already exists" });
      return;
    }
  }
  return next();
};

const idNote = (req, res, next) => {
  const { id } = req.params;
  const { user } = req;
  const note = user.notes.find((n) => n.id === id);
  if (!note) {
    res.status(404).json({ error: "note is not registered" });
    return;
  }
  req.note = note;
  return next();
};

app.post("/users", cpfAlreadyExists, (req, res) => {
  const { name, cpf } = req.body;
  const id = v4();
  const notes = [];

  USERS.push({ id, name, cpf, notes });
  res.status(201).json({ id, name, cpf, notes });
});

app.get("/users", (req, res) => {
  res.json({ USERS });
});

app.patch("/users/:cpf", userExist, (req, res) => {
  const { user } = req;
  const { name, cpf } = req.body;
  user.name = name;
  user.cpf = cpf;
  res.status(200).json({ message: "User is updated", user });
});

app.delete("/users/:cpf", userExist, (req, res) => {
  const { user } = req;
  USERS.splice(USERS.indexOf(user), 1);
  res.status(204).json("");
});

app.post("/users/:cpf/notes", userExist, (req, res) => {
  const { user } = req;
  const { title, content } = req.body;
  const id = v4();
  const created_at = new Date();
  user.notes.push({ id, title, content, created_at });
  res
    .status(201)
    .json({ message: `${title} was added into ${user.name}'s notes` });
});

app.get("/users/:cpf/notes", userExist, (req, res) => {
  const { user } = req;
  res.status(200).json(user.notes);
});

app.patch("/users/:cpf/notes/:id", userExist, idNote, (req, res) => {
  const { note } = req;
  const { title, content } = req.body;
  note.title = title;
  note.content = content;
  note.updated_at = new Date();
  res.status(200).json(note);
});

app.delete("/users/:cpf/notes/:id", userExist, idNote, (req, res) => {
  const { note } = req;
  const { user } = req;
  user.notes.splice(user.notes.indexOf(note), 1);
  res.status(204).json("");
});

app.listen(PORT, () => console.log(`App is running on port ${PORT}`));

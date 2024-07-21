const mapDBToModel = ({
  id, title, body, tags, created_at, updated_at,
}) => ({
  id,
  title,
  body,
  tags,
  createdAt: created_at,
  updatedAt: updated_at,
});

const UserMapToModel = ({
  id, username, password, fullname,
}) => ({
  id,
  username,
  password,
  fullname,
});

module.exports = { mapDBToModel, UserMapToModel };

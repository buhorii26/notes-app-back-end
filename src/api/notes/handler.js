const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class NotesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postNoteHandler(request, h) {
    try {
      this._validator.validateNotePayload(request.payload);
      const { title = 'untitled', body, tags } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      const noteId = await this._service.addNote({
        title, body, tags, owner: credentialId,
      });

      const response = h.response({
        status: 'success',
        message: 'Catatan berhasil ditambahkan',
        data: {
          noteId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getNotesHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const notes = await this._service.getNotes(credentialId);
    return {
      status: 'success',
      data: {
        notes,
      },
    };
  }

  async getNoteByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyNoteAccess(id, credentialId);
    const note = await this._service.getNoteById(id);
    const response = h.response({
      status: 'success',
      data: {
        note,
      },
    });
    response.code(200);
    return response;
  }

  async putNoteByIdHandler(request, h) {
    this._validator.validateNotePayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyNoteAccess(id, credentialId);
    await this._service.editNoteById(id, request.payload);
    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  async deleteNoteByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this._service.verifyNoteOwner(id, credentialId);
      await this._service.deleteNoteById(id);

      return {
        status: 'success',
        message: 'Catatan berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = NotesHandler;

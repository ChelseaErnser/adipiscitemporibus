/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Base} from '../../base';
import {ResourcePath} from '../../types';
import {SessionInterface} from '../../../session/types';
import {ApiVersion} from '../../../base-types';

interface FindArgs {
  session: SessionInterface;
  id: number | string;
  fields?: unknown;
}
interface DeleteArgs {
  session: SessionInterface;
  id: number | string;
}
interface AllArgs {
  [key: string]: unknown;
  session: SessionInterface;
  limit?: unknown;
  since_id?: unknown;
  created_at_min?: unknown;
  created_at_max?: unknown;
  updated_at_min?: unknown;
  updated_at_max?: unknown;
  src?: unknown;
  fields?: unknown;
}
interface CountArgs {
  [key: string]: unknown;
  session: SessionInterface;
  src?: unknown;
}

export class ScriptTag extends Base {
  public static API_VERSION = ApiVersion.October22;

  protected static NAME = 'script_tag';
  protected static PLURAL_NAME = 'script_tags';
  protected static HAS_ONE: {[key: string]: typeof Base} = {};
  protected static HAS_MANY: {[key: string]: typeof Base} = {};
  protected static PATHS: ResourcePath[] = [
    {"http_method": "delete", "operation": "delete", "ids": ["id"], "path": "script_tags/<id>.json"},
    {"http_method": "get", "operation": "count", "ids": [], "path": "script_tags/count.json"},
    {"http_method": "get", "operation": "get", "ids": [], "path": "script_tags.json"},
    {"http_method": "get", "operation": "get", "ids": ["id"], "path": "script_tags/<id>.json"},
    {"http_method": "post", "operation": "post", "ids": [], "path": "script_tags.json"},
    {"http_method": "put", "operation": "put", "ids": ["id"], "path": "script_tags/<id>.json"}
  ];

  public static async find(
    {
      session,
      id,
      fields = null
    }: FindArgs
  ): Promise<ScriptTag | null> {
    const result = await this.baseFind<ScriptTag>({
      session: session,
      urlIds: {"id": id},
      params: {"fields": fields},
    });
    return result ? result[0] : null;
  }

  public static async delete(
    {
      session,
      id
    }: DeleteArgs
  ): Promise<unknown> {
    const response = await this.request<ScriptTag>({
      http_method: "delete",
      operation: "delete",
      session: session,
      urlIds: {"id": id},
      params: {},
    });

    return response ? response.body : null;
  }

  public static async all(
    {
      session,
      limit = null,
      since_id = null,
      created_at_min = null,
      created_at_max = null,
      updated_at_min = null,
      updated_at_max = null,
      src = null,
      fields = null,
      ...otherArgs
    }: AllArgs
  ): Promise<ScriptTag[]> {
    const response = await this.baseFind<ScriptTag>({
      session: session,
      urlIds: {},
      params: {"limit": limit, "since_id": since_id, "created_at_min": created_at_min, "created_at_max": created_at_max, "updated_at_min": updated_at_min, "updated_at_max": updated_at_max, "src": src, "fields": fields, ...otherArgs},
    });

    return response;
  }

  public static async count(
    {
      session,
      src = null,
      ...otherArgs
    }: CountArgs
  ): Promise<unknown> {
    const response = await this.request<ScriptTag>({
      http_method: "get",
      operation: "count",
      session: session,
      urlIds: {},
      params: {"src": src, ...otherArgs},
      body: {},
      entity: null,
    });

    return response ? response.body : null;
  }

  public event: string | null;
  public src: string | null;
  public cache: boolean | null;
  public created_at: string | null;
  public display_scope: string | null;
  public id: number | null;
  public updated_at: string | null;
}
